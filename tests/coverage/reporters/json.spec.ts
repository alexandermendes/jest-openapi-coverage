import fse from 'fs-extra';
import { ConcreteJestOpenApiCoverageConfig } from '../../../src/config/openapi';
import { printJson } from '../../../src/coverage/reporters/json';
import { CoverageResult } from '../../../src/coverage/results';
import { logger } from '../../../src/logger';

jest.mock('fs-extra');
jest.mock('../../../src/logger');

const results: CoverageResult[] = [
  {
    path: '/articles',
    method: 'get',
    covered: true,
    percentageOfQueriesCovered: 100,
    queryParams: [],
  },
];

describe('Coverage: JSON Reporter', () => {
  it('reports to the console if no outputFile is configured', () => {
    const config = {
      format: ['json'],
    } as ConcreteJestOpenApiCoverageConfig;

    printJson(results, config);

    expect(logger.log).toHaveBeenCalledTimes(1);
    expect(logger.log).toHaveBeenCalledWith(JSON.stringify(results));

    expect(fse.writeJSONSync).not.toHaveBeenCalled();
  });

  it('writes to a file if an outputFile is configured', () => {
    const config = {
      format: ['json'],
      outputFile: '/path/to/output.json',
    } as ConcreteJestOpenApiCoverageConfig;

    printJson(results, config);

    expect(fse.ensureDirSync).toHaveBeenCalledTimes(1);
    expect(fse.ensureDirSync).toHaveBeenCalledWith('/path/to');

    expect(fse.writeJSONSync).toHaveBeenCalledTimes(1);
    expect(fse.writeJSONSync).toHaveBeenCalledWith(
      '/path/to/output.json',
      results,
    );

    expect(logger.log).not.toHaveBeenCalled();
  });
});
