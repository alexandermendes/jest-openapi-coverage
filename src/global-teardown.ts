import { getOpenApiConfig } from './config/openapi';
import { getCoverageResults } from './coverage/results';
import { reportCoverage } from './coverage/report';
import { readDocs } from './docs/io';
import { loadRequests } from './request/io';

export const globalTeardown = async () => {
  const docs = await readDocs();
  const config = getOpenApiConfig();

  if (!docs) {
    throw new Error(
      'Could not determine OpenAPI coverage as no specification has '
      + 'been provided. See the `docsPath` config option or the `writeDocs` function.',
    );
  }

  const requests = await loadRequests();
  const results = await getCoverageResults(docs, requests);

  reportCoverage(config, results);
};
