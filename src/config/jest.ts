import type { Config } from '@jest/types';
import { readConfig } from 'jest-config';
import appRoot from 'app-root-path';
import yargs from 'yargs';

const getJestArgv = (): Config.Argv => {
  const rawArgv: string[] = process.argv.slice(2);
  const argv = yargs(rawArgv);

  return Object.keys(argv).reduce(
    (acc, key) => {
      if (!key.includes('-')) {
        // @ts-ignore
        acc[key] = argv[key];
      }

      return acc;
    },
    {} as Config.Argv,
  );
};

export const getJestConfig = async () => {
  const argv = getJestArgv();
  const options = await readConfig(argv, appRoot.path);

  return options.globalConfig;
};
