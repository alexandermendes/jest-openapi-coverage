import { ClientRequestInterceptor } from '@mswjs/interceptors/lib/interceptors/ClientRequest';
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
    interceptor.dispose();

    await storeRequests(requests);
  },
};
