import fse from 'fs-extra';
import { OpenAPIObject } from 'openapi3-ts';
import path from 'path';

const getDocsPath = async (coverageDirectory: string) => (
  path.join(coverageDirectory, 'docs.json')
);

export const writeDocs = async (
  coverageDirectory: string,
  docs: string | OpenAPIObject,
) => {
  const docsPath = await getDocsPath(coverageDirectory);
  const output = typeof docs === 'string' ? docs : JSON.stringify(docs);

  fse.ensureDirSync(path.dirname(docsPath));
  fse.writeFileSync(docsPath, output);
};

export const readDocs = async (
  coverageDirectory: string,
): Promise<OpenAPIObject> => {
  const docsPath = await getDocsPath(coverageDirectory);
  const json = fse.readJSONSync(docsPath);

  return json;
};
