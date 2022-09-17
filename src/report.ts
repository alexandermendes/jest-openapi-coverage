import fse from 'fs-extra';
import path from 'path';
import rimraf from 'rimraf';
import { getCoverageDirectory } from './config';
import { InterceptedRequest } from './request';

const REQUESTS_FILE_PREFIX = 'requests';
const COVERAGE_SUB_DIRECTORY = 'openapi';

const getOpenApiCoverageDir = async (rootCoverageDir?: string) => {
  const coverageDir = rootCoverageDir ?? await getCoverageDirectory();

  return path.join(coverageDir, COVERAGE_SUB_DIRECTORY);
};

const getDocsPath = async () => {
  const coverageDir = await getOpenApiCoverageDir();

  return path.join(coverageDir, 'docs.json');
};

export const writeDocs = async (docs: string) => {
  const docsPath = await getDocsPath();

  fse.ensureDirSync(path.dirname(docsPath));
  fse.writeJsonSync(docsPath, docs);
};

export const readDocs = async () => {
  const docsPath = await getDocsPath();

  return fse.readJSONSync(docsPath);
};

export const cleanCoverageDir = async (rootCoverageDir?: string) => {
  rimraf.sync(await getOpenApiCoverageDir(rootCoverageDir));
};

export const writeRequestsFile = async (requests: InterceptedRequest[]) => {
  const coverageDir = await getOpenApiCoverageDir();
  const timestamp = new Date().getTime();
  const outputFileName = `${REQUESTS_FILE_PREFIX}-${timestamp}.json`;
  const outputPath = path.join(coverageDir, outputFileName);

  fse.ensureDirSync(path.dirname(outputPath));
  fse.writeJsonSync(outputPath, JSON.stringify(requests));
};
