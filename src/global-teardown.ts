import { reportCoverage } from './coverage';
import { readDocs } from './report/docs';
import { loadRequests } from './report/requests';

export const globalTeardown = async () => {
  const docs = await readDocs();

  if (!docs) {
    return;
  }

  const requests = await loadRequests();

  reportCoverage(docs, requests);
};
