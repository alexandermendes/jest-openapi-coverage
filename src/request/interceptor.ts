import { ClientRequestInterceptor } from '@mswjs/interceptors/lib/interceptors/ClientRequest';
import { getJestConfig } from '../config/jest';
import { getOpenApiConfig } from '../config/openapi';
import { storeRequests } from './io';
import { parseRequest, InterceptedRequest } from './parser';

const interceptor = new ClientRequestInterceptor();
const requests: InterceptedRequest[] = [];

export const requestInterceptor = {
  setup: async () => {
    interceptor.apply();

    interceptor.on('request', async (req) => {
      requests.push(await parseRequest(req));
    });
  },
  teardown: async () => {
    const jestConfig = await getJestConfig();
    const { coverageDirectory } = getOpenApiConfig(jestConfig);

    interceptor.dispose();

    if (coverageDirectory) {
      await storeRequests(coverageDirectory, requests);
    }
  },
};
