import type { Config } from '@jest/types';
import appRoot from 'app-root-path';
import path from 'path';
import { cosmiconfigSync } from 'cosmiconfig';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';
import { getOpenApiConfig } from '../../src/config/openapi';

jest.mock('cosmiconfig');
jest.mock('cosmiconfig-typescript-loader');

const explorer = {
  search: jest.fn(),
};

const globalConfig = {
  collectCoverage: true,
} as Config.GlobalConfig;

describe('Config: OpenAPI', () => {
  beforeEach(() => {
    (cosmiconfigSync as jest.Mock).mockReturnValue(explorer);
  });

  describe('getOpenApiConfig', () => {
    it('searches the app root for a config file', () => {
      getOpenApiConfig(globalConfig);

      expect(cosmiconfigSync).toHaveBeenCalledTimes(1);
      expect(cosmiconfigSync).toHaveBeenCalledWith('jest-openapi-coverage', {
        searchPlaces: [
          'package.json',
          'jest-openapi-coverage.config.js',
          'jest-openapi-coverage.config.ts',
          'jest-openapi-coverage.config.cjs',
          'jest-openapi-coverage.config.json',
        ],
        loaders: {
          '.ts': TypeScriptLoader(),
        },
      });

      expect(explorer.search).toHaveBeenCalledTimes(1);
      expect(explorer.search).toHaveBeenCalledWith(appRoot.path);
    });

    it('returns the default config if no config file exists', () => {
      const config = getOpenApiConfig(globalConfig);

      expect(config).toEqual({
        format: ['table'],
        enabled: true,
      });
    });

    it('returns a config file merged with the defaults if one exists', () => {
      explorer.search.mockReturnValue({
        config: {
          outputFile: '/path/to/docs.json',
        },
      });

      const config = getOpenApiConfig(globalConfig);

      expect(config).toEqual({
        format: ['table'],
        outputFile: '/path/to/docs.json',
        enabled: true,
      });
    });

    it('returns a config file that overrides a default value', () => {
      explorer.search.mockReturnValue({
        config: {
          format: ['json'],
          outputFile: '/path/to/docs.json',
        },
      });

      const config = getOpenApiConfig(globalConfig);

      expect(config).toEqual({
        format: ['json'],
        outputFile: '/path/to/docs.json',
        enabled: true,
      });
    });

    it.each([
      'outputFile',
      'docsPath',
    ])('converts a relative %s path to an absolute path', (key) => {
      const relativePath = './relative/path.json';

      explorer.search.mockReturnValue({
        config: {
          format: ['json'],
          [key]: './relative/path.json',
        },
      });

      const config = getOpenApiConfig(globalConfig);

      expect(config).toEqual({
        format: ['json'],
        [key]: path.join(appRoot.path, relativePath),
        enabled: true,
      });
    });

    it('disables coverage based on the enabled setting', () => {
      explorer.search.mockReturnValue({
        config: {
          enabled: false,
        },
      });

      const config = getOpenApiConfig(globalConfig);

      expect(config).toEqual({
        format: ['table'],
        enabled: false,
      });
    });

    it('disables coverage based on the jest setting', () => {
      const config = getOpenApiConfig({
        collectCoverage: false,
      } as Config.GlobalConfig);

      expect(config).toEqual({
        format: ['table'],
        enabled: false,
      });
    });
  });
});
