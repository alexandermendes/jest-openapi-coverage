import { getCoverageResults } from './coverage/results';
import { printTable } from './coverage/table';
import { readDocs } from './report/docs';
import { loadRequests } from './report/requests';

export const globalTeardown = async () => {
  const docs = await readDocs();

  if (!docs) {
    return;
  }

  const requests = await loadRequests();
  const results = await getCoverageResults(docs, requests);

  printTable(results);
};
