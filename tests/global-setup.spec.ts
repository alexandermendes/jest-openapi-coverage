import { Config } from '@jest/types';
import fse from 'fs-extra';
import { cleanOpenApiCoverageDir, getOpenApiConfig } from '../src/config/openapi';
import { writeDocs } from '../src/docs/io';
import { globalSetup } from '../src/global-setup';

jest.mock('fs-extra');
jest.mock('../src/config/openapi');
jest.mock('../src/docs/io');

const globalConfig = {
  coverageDirectory: '/coverage',
} as Config.GlobalConfig;

describe('Global setup', () => {
  beforeEach(() => {
    (getOpenApiConfig as jest.Mock).mockReturnValue({});
  });

  it('cleans the coverage dir', () => {
    globalSetup(globalConfig);

    expect(cleanOpenApiCoverageDir).toHaveBeenCalledTimes(1);
    expect(cleanOpenApiCoverageDir).toHaveBeenCalledWith(globalConfig.coverageDirectory);
  });

  it('does not load docs from the config file by default', () => {
    globalSetup(globalConfig);

    expect(writeDocs).not.toHaveBeenCalled();
  });

  it('does not load docs from the config file if a docsPath was configured', () => {
    const docsPath = '/docs.json';

    (getOpenApiConfig as jest.Mock).mockReturnValue({ docsPath });
    (fse.readJSONSync as jest.Mock).mockReturnValue({ mock: 'docs' });

    globalSetup(globalConfig);

    expect(writeDocs).toHaveBeenCalledTimes(1);
    expect(writeDocs).toHaveBeenCalledWith({ mock: 'docs' });
  });
});
