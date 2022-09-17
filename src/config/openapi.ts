import path from 'path';
import rimraf from 'rimraf';
import { getJestConfig } from './jest';

const COVERAGE_SUB_DIRECTORY = 'openapi';

export const getOpenApiCoverageDir = async (coverageDirectory?: string) => {
  const coverageDir = coverageDirectory ?? (await getJestConfig()).coverageDirectory;

  return path.join(coverageDir, COVERAGE_SUB_DIRECTORY);
};

export const cleanOpenApiCoverageDir = async (rootCoverageDir: string) => {
  rimraf.sync(await getOpenApiCoverageDir(rootCoverageDir));
};
