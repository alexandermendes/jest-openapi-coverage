import type { Config } from '@jest/types';
import path from 'path';
import appRoot from 'app-root-path';
import { cosmiconfigSync } from 'cosmiconfig';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';

const COVERAGE_SUB_DIRECTORY = 'openapi';
const OPENAPI_MODULE_NAME = 'jest-openapi-coverage';

type Format = 'table' | 'json';

export type CoverageThresholdMetric = 'operations' | 'queryParameters';

export type CoverageThreshold = {
  [key in CoverageThresholdMetric]?: number
};

export type JestOpenApiCoverageConfig = {
  format?: Format[];
  outputFile?: string;
  docsPath?: string;
  collectCoverage?: boolean;
  coverageDirectory?: string;
  coverageThreshold?: CoverageThreshold;
  throwIfNoDocs?: boolean;
  server?: {
    hostname: string;
    port?: number;
  }
};

export type ConcreteJestOpenApiCoverageConfig = JestOpenApiCoverageConfig & {
  format: ('table' | 'json')[];
  collectCoverage: boolean;
  coverageDirectory: string;
};

const getAbsolutePath = (relativeOrAbsolutePath: string) => (
  path
    .isAbsolute(relativeOrAbsolutePath)
    ? relativeOrAbsolutePath
    : path.resolve(appRoot.path, relativeOrAbsolutePath)
);

const loadOpenApiConfig = (): JestOpenApiCoverageConfig => {
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
    return result.config;
  }

  return {};
};

const getFormat = (config: JestOpenApiCoverageConfig): Format[] => {
  if (!config.format) {
    return ['table'];
  }

  return config.format;
};

const getDocsPath = (config: JestOpenApiCoverageConfig): string | undefined => {
  if (config.docsPath) {
    return getAbsolutePath(config.docsPath);
  }

  return undefined;
};

const getOutputFile = (config: JestOpenApiCoverageConfig): string | undefined => {
  if (config.outputFile) {
    return getAbsolutePath(config.outputFile);
  }

  return undefined;
};

const getCollectCoverage = (
  config: JestOpenApiCoverageConfig,
  jestGlobalConfig: Config.GlobalConfig,
): boolean => {
  if (!config.collectCoverage && config.collectCoverage !== false) {
    return jestGlobalConfig.collectCoverage;
  }

  return config.collectCoverage;
};

const getCoverageDirectory = (
  config: JestOpenApiCoverageConfig,
  jestGlobalConfig: Config.GlobalConfig,
): string => {
  if (config.coverageDirectory) {
    return getAbsolutePath(config.coverageDirectory);
  }

  return path.join(
    jestGlobalConfig.coverageDirectory,
    COVERAGE_SUB_DIRECTORY,
  );
};

export const getOpenApiConfig = (
  jestGlobalConfig: Config.GlobalConfig,
): ConcreteJestOpenApiCoverageConfig => {
  const config = loadOpenApiConfig();

  return {
    ...config,
    format: getFormat(config),
    docsPath: getDocsPath(config),
    outputFile: getOutputFile(config),
    collectCoverage: getCollectCoverage(config, jestGlobalConfig),
    coverageDirectory: getCoverageDirectory(config, jestGlobalConfig),
  };
};
