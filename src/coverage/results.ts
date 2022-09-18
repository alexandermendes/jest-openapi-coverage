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
import {
  ConcreteJestOpenApiCoverageConfig,
  CoverageThresholdMetric,
} from '../config/openapi';

type QueryParamCoverageResult = {
  name: string;
  covered: boolean;
}

export type CoverageResult = {
  path: string;
  method: string;
  covered: boolean;
  queryParams: QueryParamCoverageResult[];
  percentageOfQueriesCovered: number;
}

export type CoverageResults = {
  results: CoverageResult[];
  totals: {
    [key in CoverageThresholdMetric]: number;
  }
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

const isServerMatching = (
  request: InterceptedRequest,
  hostname: string,
  port?: number,
) => {
  const hostnameMatches = hostname === request.hostname;

  if (!port && hostnameMatches) {
    return true;
  }

  return Number(port) === Number(request.port);
};

const getMatchingRequests = (
  docs: OpenAPIObject,
  requests: InterceptedRequest[],
  openApiConfig: ConcreteJestOpenApiCoverageConfig,
  path: string,
  method: string,
  methodConfig: OperationObject,
) => requests.filter((request) => {
  if (request.method.toLowerCase() !== method) {
    return false;
  }

  const pathMatches = (
    isPathMatching(path, request.pathname)
    || isPathMatchingWithServers(path, request.pathname, methodConfig.servers)
    || isPathMatchingWithServers(path, request.pathname, docs.servers)
  );

  if (!pathMatches) {
    return false;
  }

  if (openApiConfig.server) {
    return isServerMatching(
      request,
      openApiConfig.server.hostname,
      openApiConfig.server.port,
    );
  }

  return ['127.0.0.1', 'localhost'].includes(request.hostname);
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

const getPercentageCovered = (
  total: number,
  uncovered: number,
): number => {
  if (!uncovered) {
    return 100;
  }

  if (total && total === uncovered) {
    return 0;
  }

  return ((total - uncovered) / total) * 100;
};

export const getCoverageResults = (
  docs: OpenAPIObject,
  requests: InterceptedRequest[],
  openApiConfig: ConcreteJestOpenApiCoverageConfig,
): CoverageResults => {
  const results: CoverageResult[] = [];

  let totalOperations = 0;
  let totalUncoveredOperations = 0;

  let totalQueryParams = 0;
  let totalUncoveredQueryParams = 0;

  Object.entries(docs.paths).forEach(([path, pathItemObject]: [string, PathItemObject]) => {
    Object
      .entries(pathItemObject ?? {})
      .filter(([, operationConfig]) => !!operationConfig)
      .forEach(([operation, operationConfig]: [string, OperationObject]) => {
        const matchingRequests = getMatchingRequests(
          docs,
          requests,
          openApiConfig,
          path,
          operation,
          operationConfig,
        );

        const operationCovered = !!matchingRequests.length;

        totalOperations += 1;

        if (!operationCovered) {
          totalUncoveredOperations += 1;
        }

        const matchingQueryParams = getMatchingQueryParams(matchingRequests);

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

        const uncoveredQueryParams = queryParams.filter(({ covered }) => !covered);

        totalQueryParams += queryParams.length;
        totalUncoveredQueryParams += uncoveredQueryParams.length;

        const result: CoverageResult = {
          path,
          method: operation,
          covered: operationCovered,
          queryParams,
          percentageOfQueriesCovered: getPercentageCovered(
            queryParams.length,
            uncoveredQueryParams.length,
          ),
        };

        results.push(result);
      });
  });

  return {
    results,
    totals: {
      operations: getPercentageCovered(totalOperations, totalUncoveredOperations),
      queryParameters: getPercentageCovered(totalQueryParams, totalUncoveredQueryParams),
    },
  };
};
