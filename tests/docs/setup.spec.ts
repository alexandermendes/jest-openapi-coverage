import { Config } from '@jest/types';
import { getOpenApiConfig } from '../../src/config/openapi';
import { writeDocs } from '../../src/docs/io';
import { setupOpenApiDocs } from '../../src/docs/setup';
import { openApiDocs } from '../fixtures/openapi-docs';
import { getJestConfig } from '../../src/config/jest';

jest.mock('../../src/config/jest');
jest.mock('../../src/config/openapi');
jest.mock('../../src/docs/io');

const globalConfig = {
  collectCoverage: true,
  coverageDirectory: '/coverage',
} as Config.GlobalConfig;

describe('Docs: Setup', () => {
  beforeEach(() => {
    (getJestConfig as jest.Mock).mockReturnValue(globalConfig);
    (getOpenApiConfig as jest.Mock).mockReturnValue({
      coverageDirectory: '/coverage/openapi',
    });
  });

  it('cleans the coverage dir', async () => {
    await setupOpenApiDocs(openApiDocs);

    expect(getJestConfig).toHaveBeenCalledTimes(1);

    expect(getOpenApiConfig).toHaveBeenCalledTimes(1);
    expect(getOpenApiConfig).toHaveBeenCalledWith(globalConfig);

    expect(writeDocs).toHaveBeenCalledTimes(1);
    expect(writeDocs).toHaveBeenCalledWith('/coverage/openapi', openApiDocs);
  });
});
