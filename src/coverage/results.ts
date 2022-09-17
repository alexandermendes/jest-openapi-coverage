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
import { InterceptedRequest } from '../request/parser';

type QueryParamCoverageResult = {
  name: string;
  covered: boolean;
};

export type CoverageResult = {
  path: string;
  method: string;
  covered: boolean;
  queryParams: QueryParamCoverageResult[];
  percentageOfQueriesCovered: number;
}

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

const getPercentageOfQueriesCovered = (
  queryParams: QueryParamCoverageResult[],
): number => {
  const uncoveredQueryParams = queryParams.filter(({ covered }) => !covered);
  const nUncoveredQueryParams = uncoveredQueryParams.length;
  const nQueryParams = queryParams.length;
  const hasQueryParams = !!nQueryParams;

  if (!nUncoveredQueryParams) {
    return 100;
  }

  if (hasQueryParams && nQueryParams === nUncoveredQueryParams) {
    return 0;
  }

  return (nUncoveredQueryParams / nQueryParams) * 100;
};

export const getCoverageResults = (
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

        const documentedQueryParams = parameterObjects
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

        const queryParams = documentedQueryParams.map((name: string) => ({
          name,
          covered: matchingQueryParams.includes(name),
        }));

        const result: CoverageResult = {
          path,
          method: operation,
          covered: !!matchingRequests.length,
          queryParams: queryParams,
          percentageOfQueriesCovered: getPercentageOfQueriesCovered(queryParams),
        };

        results.push(result);
      });
  });

  return results;
};
