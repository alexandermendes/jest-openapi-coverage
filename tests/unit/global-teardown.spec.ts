import { Config } from '@jest/types';
import { getOpenApiConfig, JestOpenApiCoverageConfig } from '../../src/config/openapi';
import { reportCoverage } from '../../src/coverage/report';
import { CoverageResults, getCoverageResults } from '../../src/coverage/results';
import { checkThresholds } from '../../src/coverage/thresholds';
import { readDocs } from '../../src/docs/io';
import { globalTeardown } from '../../src/global-teardown';
import { logger } from '../../src/logger';
import { loadRequests } from '../../src/request/io';
import { InterceptedRequest } from '../../src/request/parser';
import { openApiDocs } from '../fixtures/openapi-docs';

jest.mock('fs-extra');
jest.mock('rimraf');
jest.mock('../../src/config/openapi');
jest.mock('../../src/docs/io');
jest.mock('../../src/request/io');
jest.mock('../../src/coverage/report');
jest.mock('../../src/coverage/thresholds');
jest.mock('../../src/coverage/results');
jest.mock('../../src/logger');

const globalConfig = {
  collectCoverage: true,
  coverageDirectory: '/coverage',
} as Config.GlobalConfig;

const requests: InterceptedRequest[] = [
  {
    method: 'get',
    pathname: '/articles',
    query: '?limit=1&offset=2',
    body: '',
    hostname: '127.0.0.1',
    port: '7000',
  },
];

const coverageResults: CoverageResults = {
  totals: {
    operations: 100,
    queryParameters: 50,
  },
  results: [
    {
      path: '/articles',
      method: 'get',
      covered: true,
      percentageOfQueriesCovered: 0,
      queryParams: [
        { name: 'limit', covered: true },
        { name: 'offset', covered: false },
      ],
    },
  ],
};

const openApiConfig: JestOpenApiCoverageConfig = {
  collectCoverage: true,
  coverageDirectory: '/coverage/openapi',
  coverageThreshold: {
    operations: 100,
  },
};

describe('Global teardown', () => {
  beforeEach(() => {
    (getOpenApiConfig as jest.Mock).mockReturnValue(openApiConfig);
    (readDocs as jest.Mock).mockResolvedValue(openApiDocs);
    (getCoverageResults as jest.Mock).mockResolvedValue(coverageResults);
    (loadRequests as jest.Mock).mockResolvedValue(requests);
  });

  it('reports coverage and checks thresholds', async () => {
    await globalTeardown(globalConfig);

    expect(getOpenApiConfig).toHaveBeenCalledTimes(1);
    expect(getOpenApiConfig).toHaveBeenCalledWith(globalConfig);

    expect(readDocs).toHaveBeenCalledTimes(1);
    expect(readDocs).toHaveBeenCalledWith(openApiConfig.coverageDirectory);

    expect(loadRequests).toHaveBeenCalledTimes(1);
    expect(loadRequests).toHaveBeenCalledWith(openApiConfig.coverageDirectory);

    expect(getCoverageResults).toHaveBeenCalledTimes(1);
    expect(getCoverageResults).toHaveBeenCalledWith(
      openApiDocs,
      requests,
      openApiConfig,
    );

    expect(reportCoverage).toHaveBeenCalledTimes(1);
    expect(reportCoverage).toHaveBeenCalledWith(
      openApiConfig,
      coverageResults.results,
    );

    expect(checkThresholds).toHaveBeenCalledTimes(1);
    expect(checkThresholds).toHaveBeenCalledWith(
      openApiConfig.coverageThreshold,
      coverageResults,
    );
  });

  it('does nothing if not enabled', async () => {
    (getOpenApiConfig as jest.Mock).mockReturnValue({
      collectCoverage: false,
      docsPath: '/docs.json',
    });

    await globalTeardown(globalConfig);

    expect(reportCoverage).not.toHaveBeenCalled();
    expect(checkThresholds).not.toHaveBeenCalled();
  });

  it('logs a warning if no docs could be found', async () => {
    (readDocs as jest.Mock).mockResolvedValue(null);

    await globalTeardown(globalConfig);

    expect(reportCoverage).not.toHaveBeenCalled();
    expect(checkThresholds).not.toHaveBeenCalled();

    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect((logger.warn as jest.Mock).mock.calls[0][0]).toMatchSnapshot();
  });

  it('throws an error if no docs could be found and throwIfNoDocs set', async () => {
    (readDocs as jest.Mock).mockResolvedValue(null);
    (getOpenApiConfig as jest.Mock).mockReturnValue({
      ...openApiConfig,
      throwIfNoDocs: true,
    });

    await expect(async () => globalTeardown(globalConfig)).rejects.toThrow();
    expect(reportCoverage).not.toHaveBeenCalled();
    expect(checkThresholds).not.toHaveBeenCalled();
  });
});
