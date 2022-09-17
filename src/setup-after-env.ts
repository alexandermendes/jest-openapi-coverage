import { requestInterceptor } from './request-interceptor';

beforeAll(requestInterceptor.setup);
afterAll(requestInterceptor.teardown);
