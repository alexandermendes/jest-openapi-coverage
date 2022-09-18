import { Config } from '@jest/types';
import fse from 'fs-extra';
import rimraf from 'rimraf';
import { getOpenApiConfig } from '../src/config/openapi';
import { writeDocs } from '../src/docs/io';
import { globalSetup } from '../src/global-setup';

jest.mock('fs-extra');
jest.mock('rimraf');
jest.mock('../src/config/openapi');
jest.mock('../src/docs/io');

const globalConfig = {
  collectCoverage: true,
  coverageDirectory: '/coverage',
} as Config.GlobalConfig;

describe('Global setup', () => {
  beforeEach(() => {
    (getOpenApiConfig as jest.Mock).mockReturnValue({
      collectCoverage: true,
      coverageDirectory: '/coverage/openapi',
    });
  });

  it('cleans the coverage dir', () => {
    globalSetup(globalConfig);

    expect(rimraf.sync).toHaveBeenCalledTimes(1);
    expect(rimraf.sync).toHaveBeenCalledWith('/coverage/openapi');
  });

  it('does not load docs from the config file by default', () => {
    globalSetup(globalConfig);

    expect(writeDocs).not.toHaveBeenCalled();
  });

  it('loads docs from the config file if a docsPath was configured', () => {
    const docsPath = '/docs.json';

    (fse.readJSONSync as jest.Mock).mockReturnValue({ mock: 'docs' });
    (getOpenApiConfig as jest.Mock).mockReturnValue({
      collectCoverage: true,
      docsPath,
      coverageDirectory: '/coverage/openapi',
    });

    globalSetup(globalConfig);

    expect(writeDocs).toHaveBeenCalledTimes(1);
    expect(writeDocs).toHaveBeenCalledWith('/coverage/openapi', { mock: 'docs' });
  });

  it('does nothing if not enabled', () => {
    (fse.readJSONSync as jest.Mock).mockReturnValue({ mock: 'docs' });
    (getOpenApiConfig as jest.Mock).mockReturnValue({
      collectCoverage: false,
      docsPath: '/docs.json',
    });

    globalSetup(globalConfig);

    expect(writeDocs).not.toHaveBeenCalled();
    expect(rimraf.sync).not.toHaveBeenCalled();
  });
});
