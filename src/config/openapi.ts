import path from 'path';
import rimraf from 'rimraf';
import appRoot from 'app-root-path';
import { cosmiconfigSync } from 'cosmiconfig';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';
import { getJestConfig } from './jest';

const COVERAGE_SUB_DIRECTORY = 'openapi';
const OPENAPI_MODULE_NAME = 'jest-openapi-coverage';

export type OpenApiCoverageConfig = {
  format: ('table' | 'json')[];
  outputFile?: string;
  docsPath?: string;
};

const defaultConfig: OpenApiCoverageConfig = {
  format: ['table'],
};

const getAbsolutePath = (relativeOrAbsolutePath: string) => (
  path
    .isAbsolute(relativeOrAbsolutePath)
    ? relativeOrAbsolutePath
    : path.resolve(appRoot.path, relativeOrAbsolutePath)
);

const loadOpenApiConfig = (): OpenApiCoverageConfig => {
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

export const getOpenApiConfig = (): OpenApiCoverageConfig => {
  const config = loadOpenApiConfig();

  if (config.docsPath) {
    config.docsPath = getAbsolutePath(config.docsPath);
  }

  if (config.outputFile) {
    config.outputFile = getAbsolutePath(config.outputFile);
  }

  return config;
};

export const getOpenApiCoverageDir = async (coverageDirectory?: string) => {
  const coverageDir = coverageDirectory ?? (await getJestConfig()).coverageDirectory;

  return path.join(coverageDir, COVERAGE_SUB_DIRECTORY);
};

export const cleanOpenApiCoverageDir = async (rootCoverageDir: string) => {
  rimraf.sync(await getOpenApiCoverageDir(rootCoverageDir));
};
