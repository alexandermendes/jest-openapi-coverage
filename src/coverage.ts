import { Table } from 'console-table-printer';
import qs from 'qs';
import {
  isSchemaObject,
  OpenAPIObject,
  OperationObject,
  ParameterObject,
  PathItemObject,
  ReferenceObject,
  ServerObject,
} from 'openapi3-ts';
import { InterceptedRequest } from './request';

type QueryParamCoverageResult = {
  name: string;
  covered: boolean;
};

type CoverageResult = {
  path: string;
  method: string;
  covered: boolean;
  queryParams: QueryParamCoverageResult[];
}

const table = new Table({
  columns: [
    { name: 'method', alignment: 'left', title: 'Method' },
    { name: 'endpoint', alignment: 'left', title: 'Endpoint' },
    { name: 'queries', alignment: 'center', title: '% Queries' },
    { name: 'uncovered', alignment: 'left', title: 'Uncovered queries' },
  ],
});

const getPathParts = (path: string) => path.replace(/^\/|\/$/g, '').split('/');

const isPathMatching = (openApiPath: string, requestPath: string) => {
  const openApiParts = getPathParts(openApiPath);
  const requestParts = getPathParts(requestPath);

  return openApiParts.every((part, index) => (
    part === requestParts[index]
    || (/^\{.*\}$/.test(part) && requestParts[index] !== undefined)
  ));
};

const isPathMatchingWithServers = (
  openApiPath: string,
  requestPath: string,
  servers?: ServerObject[],
): boolean => !!servers
  ?.some((server) => {
    const { pathname: serverPath } = new URL(server.url);
    const strippedPath = requestPath.replace(new RegExp(`^${serverPath}`), '');

    return isPathMatching(openApiPath, strippedPath);
  });

const getMatchingRequests = (
  docs: OpenAPIObject,
  requests: InterceptedRequest[],
  path: string,
  method: string,
  methodConfig: OperationObject,
) => requests.filter((request) => {
  console.log(request);

  if (request.method.toLowerCase() !== method) {
    return false;
  }

  return (
    isPathMatching(path, request.pathname)
    || isPathMatchingWithServers(path, request.pathname, methodConfig.servers)
    || isPathMatchingWithServers(path, request.pathname, docs.servers)
  );
});

const getMatchingQueryParams = (
  requests: InterceptedRequest[],
) => requests.reduce((acc, request) => {
  const parsedQuery = qs.parse(request.query.replace('?', ''));

  Object.entries(parsedQuery).forEach(([key, value]) => {
    if (typeof value !== 'object') {
      acc.push(key);

      return;
    }

    acc.push(...Object.keys(value).map((nestedKey) => `${key}[${nestedKey}]`));
  });

  return [...new Set(acc)];
}, [] as string[]);

const isParameterObject = (
  obj: ParameterObject | ReferenceObject,
): obj is ParameterObject => (
  ('in' in obj) && obj.in === 'query'
);

const getCoverageResults = (
  docs: OpenAPIObject,
  requests: InterceptedRequest[],
): CoverageResult[] => {
  const results: CoverageResult[] = [];

  Object.entries(docs.paths).forEach(([path, operations]: [string, PathItemObject]) => {
    Object
      .entries(operations ?? {})
      .forEach(([operation, operationConfig]: [string, OperationObject]) => {
        const matchingRequests = getMatchingRequests(
          docs,
          requests,
          path,
          operation,
          operationConfig,
        );

        const matchingQueryParams = getMatchingQueryParams(matchingRequests);

        if (typeof operationConfig !== 'object') {
          return;
        }

        const parameterObjects: ParameterObject[] = operationConfig
          .parameters
          ?.filter(isParameterObject) ?? [];

        const flatQueryParameters = parameterObjects
          .reduce((acc, param) => {
            if (
              param.style === 'deepObject'
              && param.schema
              && isSchemaObject(param.schema)
              && param.schema.properties
            ) {
              Object.keys(param.schema.properties).forEach((key) => {
                acc.push(`${param.name}[${key}]`);
              });

              return acc;
            }

            return [...acc, param.name];
          }, [] as string[]) ?? [];

        const result: CoverageResult = {
          path,
          method: operation,
          covered: !!matchingRequests.length,
          queryParams: flatQueryParameters.map((name: string) => ({
            name,
            covered: matchingQueryParams.includes(name),
          })),
        };

        results.push(result);
      });
  });

  return results;
};

const getRowColour = (
  result: CoverageResult,
  percentageQueriesCovered: number,
) => {
  if (!result.covered) {
    return 'red';
  }

  if (percentageQueriesCovered < 100) {
    return 'yellow';
  }

  return 'green';
};

const getPercentageQueriesCovered = (
  nQueries: number,
  nUncoveredQueries: number,
): number => {
  if (!nQueries) {
    return 100;
  }

  const percentage = (100 * nUncoveredQueries) / nQueries;
  const fixedPercentage = (percentage).toFixed(2);

  return Number(fixedPercentage);
};

const addTableRow = (result: CoverageResult) => {
  const uncoveredQueries = result
    .queryParams
    .filter(({ covered }) => !covered);

  const percentageQueriesCovered = getPercentageQueriesCovered(
    result.queryParams.length,
    uncoveredQueries.length,
  );

  table.addRow({
    method: result.method.toUpperCase(),
    endpoint: result.path,
    queries: percentageQueriesCovered,
    uncovered: `${uncoveredQueries
      .map(({ name }) => name)
      .slice(0, 3)
      .join(', ')}${uncoveredQueries.length > 3 ? '...' : ''}`,
  }, {
    color: getRowColour(result, percentageQueriesCovered),
  });
};

export const reportCoverage = (
  docs: OpenAPIObject,
  requests: InterceptedRequest[],
) => {
  const results = getCoverageResults(docs, requests);

  results.forEach(addTableRow);
  table.printTable();
};
