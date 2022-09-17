import { Table } from 'console-table-printer';
import { printTable } from '../../src/coverage/table';

jest.mock('console-table-printer');

describe('Table', () => {
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
    covered  | percentage | color
    ${true}  | ${100}     | ${'green'}
    ${true}  | ${50}      | ${'yellow'}
    ${false} | ${100}     | ${'red'}
  `(
    'adds a $color table row for covered=$covered and percentage=$percentage',
    ({
      covered,
      percentage,
      color,
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
          endpoint: '/articles',
          method: 'GET',
          queries: String(percentage),
          uncoveredQueries: '',
        },
        { color },
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
        endpoint: '/articles',
        method: 'GET',
        queries: '66.67',
        uncoveredQueries: 'one, two',
      },
      { color: 'yellow' },
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
