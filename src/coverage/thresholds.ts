import { CoverageThreshold } from '../config/openapi';
import { logger } from '../logger';
import { percentageToString } from './format';
import { CoverageResults, CoverageThresholdMetric } from './results';

export const checkThresholds = (
  coverageThreshold: CoverageThreshold,
  coverageResults: CoverageResults,
) => {
  const metrics: CoverageThresholdMetric[] = ['operations', 'queryParameters'];

  const passed = metrics.filter((key) => {
    const result = coverageResults.totals[key];
    const threshold = coverageThreshold[key];

    const getMessage = (condition?: string) => [
      `Jest OpenAPI: coverage threshold for ${key}`,
      condition,
      'met:',
      `${percentageToString(result)}%`,
    ].filter((x) => x).join(' ');

    if (!threshold) {
      return true;
    }

    if (result < threshold) {
      logger.error(getMessage('not'));

      return false;
    }

    logger.success(getMessage());

    return true;
  });

  if (!passed) {
    process.exitCode = 1;
  }
};
