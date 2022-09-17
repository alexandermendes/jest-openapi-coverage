import type { Config } from '@jest/types';
import { cleanOpenApiCoverageDir } from './config/openapi';

export const globalSetup = (globalConfig: Config.GlobalConfig) => {
  cleanOpenApiCoverageDir(globalConfig.coverageDirectory);
};
