import type { Config } from '@jest/types';
import { ConcreteJestOpenApiCoverageConfig, getOpenApiConfig } from './config/openapi';
import { getCoverageResults } from './coverage/results';
import { reportCoverage } from './coverage/report';
import { readDocs } from './docs/io';
import { loadRequests } from './request/io';
import { checkThresholds } from './coverage/thresholds';
import { logger } from './logger';

const NO_DOCS_MESSAGE = 'Could not determine OpenAPI coverage as no specification '
  + 'has been provided. See the `docsPath` config option or the `setupOpenApiDocs` function.';

const handleNoDocs = (
  throwIfNoDocs?: boolean,
) => {
  if (throwIfNoDocs) {
    throw new Error(NO_DOCS_MESSAGE);
  }

  logger.warn(NO_DOCS_MESSAGE);
};

export const globalTeardown = async (globalConfig: Config.GlobalConfig) => {
  const openApiConfig = getOpenApiConfig(globalConfig);

  if (!openApiConfig.collectCoverage) {
    return;
  }

  const docs = await readDocs(openApiConfig.coverageDirectory);

  if (!docs) {
    handleNoDocs(openApiConfig.throwIfNoDocs);

    return;
  }

  const requests = await loadRequests(openApiConfig.coverageDirectory);
  const coverageResults = await getCoverageResults(docs, requests, openApiConfig);

  reportCoverage(openApiConfig, coverageResults.results);

  if (openApiConfig.coverageThreshold) {
    checkThresholds(openApiConfig.coverageThreshold, coverageResults);
  }
};
