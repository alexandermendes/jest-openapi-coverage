import { getCoverageResults } from './coverage/results';
import { printTable } from './coverage/table';
import { readDocs } from './docs/io';
import { loadRequests } from './request/io';

export const globalTeardown = async () => {
  const docs = await readDocs();

  if (!docs) {
    return;
  }

  const requests = await loadRequests();
  const results = await getCoverageResults(docs, requests);

  printTable(results);
};
