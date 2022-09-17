import fse from 'fs-extra';
import path from 'path';
import { InterceptedRequest } from './parser';

const REQUESTS_FILE_PREFIX = 'requests';

export const storeRequests = async (
  coverageDir: string,
  requests: InterceptedRequest[],
) => {
  const timestamp = new Date().getTime();
  const outputFileName = `${REQUESTS_FILE_PREFIX}-${timestamp}.json`;
  const outputPath = path.join(coverageDir, outputFileName);

  fse.ensureDirSync(path.dirname(outputPath));
  fse.writeJsonSync(outputPath, requests);
};

export const loadRequests = async (
  coverageDir: string,
): Promise<InterceptedRequest[]> => {
  const requestFiles = fse
    .readdirSync(coverageDir, { withFileTypes: true })
    .filter((dirent) => !dirent.isDirectory())
    .filter((dirent) => dirent.name.startsWith(REQUESTS_FILE_PREFIX))
    .map((dirent) => path.join(coverageDir, dirent.name));

  return requestFiles.reduce((acc, requestFile) => {
    const parsedRequests = fse.readJSONSync(requestFile);

    return [...acc, ...parsedRequests];
  }, [] as InterceptedRequest[]);
};
