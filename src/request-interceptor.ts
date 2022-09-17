import { InterceptedRequest, RequestInterceptor } from 'node-request-interceptor';
import withDefaultInterceptors from 'node-request-interceptor/lib/presets/default';
import { writeRequestsFile } from './report';

const interceptor = new RequestInterceptor(withDefaultInterceptors);
const requests: InterceptedRequest[] = [];

export const requestInterceptor = {
  setup: async () => {
    interceptor.use((req) => {
      requests.push(req);
    });
  },
  teardown: async () => {
    const { testPath } = expect.getState();

    await writeRequestsFile(requests, testPath);
  },
};
