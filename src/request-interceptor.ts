import { ClientRequestInterceptor } from '@mswjs/interceptors/lib/interceptors/ClientRequest';
import { writeRequestsFile } from './report/requests';
import { convertRequest, InterceptedRequest } from './request';

const interceptor = new ClientRequestInterceptor();
const requests: InterceptedRequest[] = [];

export const requestInterceptor = {
  setup: async () => {
    interceptor.apply();

    interceptor.on('request', async (req) => {
      requests.push(await convertRequest(req));
    });
  },
  teardown: async () => {
    interceptor.dispose();

    await writeRequestsFile(requests);
  },
};
