import fse from 'fs-extra';
import type { Config } from '@jest/types';
import { cleanOpenApiCoverageDir, getOpenApiConfig } from './config/openapi';
import { writeDocs } from './docs/io';

export const globalSetup = (globalConfig: Config.GlobalConfig) => {
  const openApiConfig = getOpenApiConfig();

  if (openApiConfig.docsPath) {
    writeDocs(fse.readJSONSync(openApiConfig.docsPath));
  }

  cleanOpenApiCoverageDir(globalConfig.coverageDirectory);
};
