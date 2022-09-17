import appRoot from 'app-root-path';
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

  const outputPath = path.isAbsolute(outputFile)
    ? outputFile
    : path.resolve(appRoot.path, outputFile);

  fse.ensureDirSync(path.dirname(outputPath));
  fse.writeJSONSync(outputPath, results);
};
