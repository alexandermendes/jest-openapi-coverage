/* eslint-disable no-console */
import chalk from 'chalk';

export const logger = {
  log: (msg: string) => console.log(msg),
  error: (msg: string) => console.error(chalk.bold.redBright(msg)),
  success: (msg: string) => console.log(chalk.bold.greenBright(msg)),
  warn: (msg: string) => console.log(chalk.bold.yellowBright(msg)),
};
