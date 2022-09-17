import type { OpenApiCoverageConfig } from '../config/openapi';
import type { CoverageResult } from './results';
import { printTable } from './reporters/table';
import { printJson } from './reporters/json';

export const reportCoverage = async (
  config: OpenApiCoverageConfig,
  results: CoverageResult[],
) => {
  if (config.format.includes('table')) {
    printTable(results);
  }

  if (config.format.includes('json')) {
    printJson(results, config);
  }
};
