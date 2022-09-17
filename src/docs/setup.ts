import { OpenAPIObject } from 'openapi3-ts';
import { getJestConfig } from '../config/jest';
import { getOpenApiConfig } from '../config/openapi';
import { writeDocs } from './io';

export const setupOpenApiDocs = async (docs: OpenAPIObject) => {
  const jestConfig = await getJestConfig();
  const { coverageDirectory } = await getOpenApiConfig(jestConfig);

  await writeDocs(coverageDirectory, docs);
};
