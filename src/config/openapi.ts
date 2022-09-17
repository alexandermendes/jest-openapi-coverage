import path from 'path';
import rimraf from 'rimraf';
import appRoot from 'app-root-path';
import { cosmiconfigSync } from 'cosmiconfig';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';
import { getJestConfig } from './jest';

const COVERAGE_SUB_DIRECTORY = 'openapi';
const OPENAPI_MODULE_NAME = 'jest-openapi-coverage';

export type JestOpenApiCoverageConfig = {
  format: ('table' | 'json')[];
  outputFile?: string;
};

const defaultConfig: JestOpenApiCoverageConfig = {
  format: ['table'],
};

export const getOpenApiConfig = (): JestOpenApiCoverageConfig => {
  const explorer = cosmiconfigSync(OPENAPI_MODULE_NAME, {
    searchPlaces: [
      'package.json',
      `${OPENAPI_MODULE_NAME}.config.js`,
      `${OPENAPI_MODULE_NAME}.config.ts`,
      `${OPENAPI_MODULE_NAME}.config.cjs`,
      `${OPENAPI_MODULE_NAME}.config.json`,
    ],
    loaders: {
      '.ts': TypeScriptLoader(),
    },
  });

  const result = explorer.search(appRoot.path);

  if (result) {
    return { ...defaultConfig, ...result.config };
  }

  return defaultConfig;
};

export const getOpenApiCoverageDir = async (coverageDirectory?: string) => {
  const coverageDir = coverageDirectory ?? (await getJestConfig()).coverageDirectory;

  return path.join(coverageDir, COVERAGE_SUB_DIRECTORY);
};

export const cleanOpenApiCoverageDir = async (rootCoverageDir: string) => {
  rimraf.sync(await getOpenApiCoverageDir(rootCoverageDir));
};
