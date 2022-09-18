import fse from 'fs-extra';
import rimraf from 'rimraf';
import type { Config } from '@jest/types';
import { getOpenApiConfig } from './config/openapi';
import { writeDocs } from './docs/io';

export const globalSetup = (globalConfig: Config.GlobalConfig) => {
  const openApiConfig = getOpenApiConfig(globalConfig);

  if (!openApiConfig.collectCoverage) {
    return;
  }

  if (openApiConfig.docsPath) {
    writeDocs(
      openApiConfig.coverageDirectory,
      fse.readJSONSync(openApiConfig.docsPath),
    );
  }

  rimraf.sync(openApiConfig.coverageDirectory);
};
