import { JestOpenApiCoverageConfig } from '../../src/config/openapi';
import { reportCoverage } from '../../src/coverage/report';
import { printJson } from '../../src/coverage/reporters/json';
import { printTable } from '../../src/coverage/reporters/table';
import { CoverageResult } from '../../src/coverage/results';

jest.mock('../../src/coverage/reporters/table');
jest.mock('../../src/coverage/reporters/json');

const results: CoverageResult[] = [
  {
    path: '/articles',
    method: 'get',
    covered: true,
    percentageOfQueriesCovered: 100,
    queryParams: [],
  },
];

describe('Coverage: Report', () => {
  it('reports using the table reporter', () => {
    const config: JestOpenApiCoverageConfig = {
      format: ['table'],
    };

    reportCoverage(config, results);

    expect(printTable).toHaveBeenCalledTimes(1);
    expect(printTable).toHaveBeenCalledWith(results);
  });

  it('reports using the json reporter', () => {
    const config: JestOpenApiCoverageConfig = {
      format: ['json'],
    };

    reportCoverage(config, results);

    expect(printJson).toHaveBeenCalledTimes(1);
    expect(printJson).toHaveBeenCalledWith(results, config);
  });
});
