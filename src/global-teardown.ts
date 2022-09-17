import type { Config } from '@jest/types';
import { getOpenApiConfig } from './config/openapi';
import { getCoverageResults } from './coverage/results';
import { reportCoverage } from './coverage/report';
import { readDocs } from './docs/io';
import { loadRequests } from './request/io';

export const globalTeardown = async (globalConfig: Config.GlobalConfig) => {
  const openApiConfig = getOpenApiConfig(globalConfig);

  if (!openApiConfig.enabled) {
    return;
  }

  const docs = await readDocs(openApiConfig.coverageDirectory);

  if (!docs) {
    throw new Error(
      'Could not determine OpenAPI coverage as no specification has been provided. '
      + 'See the `docsPath` config option or the `setupOpenApiDocs` function.',
    );
  }

  const requests = await loadRequests(globalConfig.coverageDirectory);
  const results = await getCoverageResults(docs, requests);

  reportCoverage(openApiConfig, results);
};
