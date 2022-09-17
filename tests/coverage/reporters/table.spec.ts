import { Table } from 'console-table-printer';
import { printTable } from '../../../src/coverage/reporters/table';

jest.mock('console-table-printer');
jest.mock('chalk', () => ({
  bold: {
    redBright: (str: string) => `red(${str})`,
    yellowBright: (str: string) => `yellow(${str})`,
    greenBright: (str: string) => `green(${str})`,
  },
}));

describe('Coverage: Table Reporter', () => {
  it('sets up and prints the table', () => {
    printTable([
      {
        method: 'get',
        path: '/articles',
        queryParams: [],
        percentageOfQueriesCovered: 100,
        covered: true,
      },
    ]);

    const mockTables = (Table as jest.Mock).mock.instances;
    const [mockTableCalls] = (Table as jest.Mock).mock.calls;

    expect(mockTables).toHaveLength(1);
    expect(mockTableCalls).toEqual([
      {
        columns: [
          {
            name: 'method',
            alignment: 'left',
            title: 'Method',
          },
          {
            name: 'endpoint',
            alignment: 'left',
            title: 'Endpoint',
          },
          {
            name: 'queries',
            alignment: 'right',
            title: '% Queries',
          },
          {
            name: 'uncoveredQueries',
            alignment: 'left',
            title: 'Uncovered queries',
          },
        ],
      },
    ]);

    expect(mockTables[0].printTable).toHaveBeenCalledTimes(1);
  });

  it.each`
    covered  | percentage | primaryColor   | secondaryColor
    ${true}  | ${100}     | ${'green'}     | ${'green'}
    ${true}  | ${50}      | ${'green'}     | ${'yellow'}
    ${false} | ${100}     | ${'red'}       | ${'green'}
    ${false} | ${0}       | ${'red'}       | ${'red'}
    ${true}  | ${0}       | ${'green'}     | ${'red'}
  `(
    'adds a $color table row for covered=$covered and percentage=$percentage',
    ({
      covered,
      percentage,
      primaryColor,
      secondaryColor,
    }) => {
      printTable([
        {
          method: 'get',
          path: '/articles',
          queryParams: [],
          percentageOfQueriesCovered: percentage,
          covered,
        },
      ]);

      const [mockTable] = (Table as jest.Mock).mock.instances;

      expect(mockTable.addRow).toHaveBeenCalledTimes(1);
      expect(mockTable.addRow).toHaveBeenCalledWith(
        {
          endpoint: `${primaryColor}(/articles)`,
          method: `${primaryColor}(GET)`,
          queries: `${secondaryColor}(${percentage})`,
          uncoveredQueries: `${secondaryColor}()`,
        },
      );
    },
  );

  it('prints a row for partially covered queries', () => {
    printTable([
      {
        method: 'get',
        path: '/articles',
        queryParams: [
          { name: 'one', covered: false },
          { name: 'two', covered: false },
          { name: 'three', covered: true },
        ],
        percentageOfQueriesCovered: 66.6666667,
        covered: true,
      },
    ]);

    const [mockTable] = (Table as jest.Mock).mock.instances;

    expect(mockTable.addRow).toHaveBeenCalledTimes(1);
    expect(mockTable.addRow).toHaveBeenCalledWith(
      {
        endpoint: 'green(/articles)',
        method: 'green(GET)',
        queries: 'yellow(66.67)',
        uncoveredQueries: 'yellow(one, two)',
      },
    );
  });

  it('concatenates many uncovered queries', () => {
    printTable([
      {
        method: 'get',
        path: '/articles',
        queryParams: Array(20).fill(null).map((_, i) => ({
          name: `param${i}`,
          covered: false,
        })),
        percentageOfQueriesCovered: 66.6666667,
        covered: true,
      },
    ]);

    const [mockTable] = (Table as jest.Mock).mock.instances;

    expect(mockTable.addRow).toHaveBeenCalledTimes(1);
    expect(mockTable.addRow.mock.calls[0][0].uncoveredQueries).toMatchSnapshot();
  });
});
