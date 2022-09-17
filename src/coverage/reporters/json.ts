import fse from 'fs-extra';
import path from 'path';
import { JestOpenApiCoverageConfig } from '../../config/openapi';
import { CoverageResult } from '../results';
import { logger } from '../../logger';

export const printJson = (
  results: CoverageResult[],
  config: JestOpenApiCoverageConfig,
) => {
  const { outputFile } = config;

  if (!outputFile) {
    logger.log(JSON.stringify(results));

    return;
  }

  fse.ensureDirSync(path.dirname(outputFile));
  fse.writeJSONSync(outputFile, results);
};
