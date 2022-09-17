import fse from 'fs-extra';
import { OpenAPIObject } from 'openapi3-ts';
import path from 'path';
import { getOpenApiCoverageDir } from '../config/openapi';

const getDocsPath = async () => {
  const coverageDir = await getOpenApiCoverageDir();

  return path.join(coverageDir, 'docs.json');
};

export const writeDocs = async (docs: string | OpenAPIObject) => {
  const docsPath = await getDocsPath();
  const output = typeof docs === 'string' ? docs : JSON.stringify(docs);

  fse.ensureDirSync(path.dirname(docsPath));
  fse.writeFileSync(docsPath, output);
};

export const readDocs = async (): Promise<OpenAPIObject> => {
  const docsPath = await getDocsPath();
  const json = fse.readJSONSync(docsPath);

  return json;
};
