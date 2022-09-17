/* eslint-disable no-console */
import chalk from 'chalk';

export const logger = {
  log: (msg: string) => console.log(msg),
  error: (msg: string) => console.error(chalk.red(msg)),
  success: (msg: string) => console.log(chalk.green(msg)),
  warn: (msg: string) => console.log(chalk.yellow(msg)),
};
