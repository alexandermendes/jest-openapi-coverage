import type { Config } from '@jest/types';
import { cleanCoverageDir } from './report';

export const globalSetup = (globalConfig: Config.GlobalConfig) => {
  cleanCoverageDir(globalConfig.coverageDirectory);
};
