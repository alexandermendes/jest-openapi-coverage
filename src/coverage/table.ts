import { Table } from 'console-table-printer';
import { CoverageResult } from './results';

enum RowColours {
  red = 'red',
  yellow = 'yellow',
  green = 'green',
}

type TableColumnName =
  'method' |
  'endpoint' |
  'queries' |
  'uncoveredQueries';

type TableColumn = {
  name: TableColumnName;
  alignment: 'left' | 'center' | 'right';
  title: string;
}

type TableRow = { [key in TableColumnName]: string }

type TableOptions = { color: RowColours }

const MAX_WIDTH = 80;

const getRowColour = (
  result: CoverageResult,
  percentageQueriesCovered: number,
) => {
  if (!result.covered) {
    return RowColours.red;
  }

  if (percentageQueriesCovered < 100) {
    return RowColours.yellow;
  }

  return RowColours.green;
};

const addTableRow = (table: Table, result: CoverageResult) => {
  const uncoveredQueries = result
    .queryParams
    .filter(({ covered }) => !covered);

  const row: TableRow = {
    method: result.method.toUpperCase(),
    endpoint: result.path,
    queries: result
      .percentageOfQueriesCovered
      .toFixed(2)
      .replace(/0?0$/, '')
      .replace(/\.$/, ''),
    uncoveredQueries: `${uncoveredQueries
      .map(({ name }) => name)
      .reduce((acc, name) => {
        if (acc.length < MAX_WIDTH) {
          return [acc, name].filter((str) => str).join(', ');
        }

        if (!acc.endsWith('...')) {
          return `${acc}...`;
        }

        return acc;
      }, '')}`,
  };

  const options: TableOptions = {
    color: getRowColour(result, result.percentageOfQueriesCovered),
  };

  table.addRow(row, options);
};

export const printTable = (results: CoverageResult[]) => {
  const columns: TableColumn[] = [
    { name: 'method', alignment: 'left', title: 'Method' },
    { name: 'endpoint', alignment: 'left', title: 'Endpoint' },
    { name: 'queries', alignment: 'right', title: '% Queries' },
    { name: 'uncoveredQueries', alignment: 'left', title: 'Uncovered queries' },
  ];

  const table = new Table({ columns });

  results.forEach((result) => addTableRow(table, result));
  table.printTable();
};
