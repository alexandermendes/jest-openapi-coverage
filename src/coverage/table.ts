import { Table } from 'console-table-printer';
import { CoverageResult } from './results';

const table = new Table({
  columns: [
    { name: 'method', alignment: 'left', title: 'Method' },
    { name: 'endpoint', alignment: 'left', title: 'Endpoint' },
    { name: 'queries', alignment: 'right', title: '% Queries' },
    { name: 'uncovered', alignment: 'left', title: 'Uncovered queries' },
  ],
});

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

const addTableRow = (result: CoverageResult) => {
  const uncoveredQueries = result
    .queryParams
    .filter(({ covered }) => !covered);

  table.addRow({
    method: result.method.toUpperCase(),
    endpoint: result.path,
    queries: result
      .percentageOfQueriesCovered
      .toFixed(2)
      .replace(/0?0$/, '')
      .replace(/\.$/, ''),
    uncovered: `${uncoveredQueries
      .map(({ name }) => name)
      .reduce((acc, name) => {
        if (acc.length < 80) {
          return [acc, name].filter(str => str).join(', ');
        }

        if (!acc.endsWith('...')) {
          return `${acc}...`;
        }

        return acc;
      }, '')}`,
  }, {
    color: getRowColour(result, result.percentageOfQueriesCovered),
  });
};

export const printTable = (results: CoverageResult[]) => {
  results.forEach(addTableRow);
  table.printTable();
};
