import chalk from 'chalk';
import { Table } from 'console-table-printer';
import { CoverageResult } from '../results';
import { percentageToString } from '../format';

type TableColumnName =
  'method' |
  'path' |
  'queries' |
  'uncoveredQueries';

type TableColumn = {
  name: TableColumnName;
  alignment: 'left' | 'center' | 'right';
  title: string;
}

type TableRow = { [key in TableColumnName]: string }

const MAX_WIDTH = 80;

const colour = (
  text: string,
  conditon: boolean | number,
) => {
  if (typeof conditon === 'boolean') {
    return conditon ? chalk.bold.greenBright(text) : chalk.bold.redBright(text);
  }

  if (conditon === 0) {
    return chalk.bold.redBright(text);
  }

  if (conditon < 100) {
    return chalk.bold.yellowBright(text);
  }

  return chalk.bold.greenBright(text);
};

const addTableRow = (table: Table, result: CoverageResult) => {
  const uncoveredQueries = result
    .queryParams
    .filter(({ covered }) => !covered);

  const row: TableRow = {
    method: colour(result.method.toUpperCase(), result.covered),
    path: colour(result.path, result.covered),
    queries: colour(
      percentageToString(result.percentageOfQueriesCovered),
      result.percentageOfQueriesCovered,
    ),
    uncoveredQueries: colour(`${uncoveredQueries
      .map(({ name }) => name)
      .reduce((acc, name) => {
        if (acc.length < MAX_WIDTH) {
          return [acc, name].filter((str) => str).join(', ');
        }

        if (!acc.endsWith('...')) {
          return `${acc}...`;
        }

        return acc;
      }, '')}`, result.percentageOfQueriesCovered),
  };

  table.addRow(row);
};

export const printTable = (results: CoverageResult[]) => {
  const columns: TableColumn[] = [
    { name: 'method', alignment: 'left', title: 'Method' },
    { name: 'path', alignment: 'left', title: 'Path' },
    { name: 'queries', alignment: 'right', title: '% Queries' },
    { name: 'uncoveredQueries', alignment: 'left', title: 'Uncovered queries' },
  ];

  const table = new Table({ columns });

  results.forEach((result) => addTableRow(table, result));
  table.printTable();
};
