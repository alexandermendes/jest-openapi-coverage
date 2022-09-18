import { IsomorphicRequest } from '@mswjs/interceptors';

type RequestBody = null | Record<string, any> | string;

export type InterceptedRequest = {
  method: string;
  pathname: URL['pathname'];
  query: URL['search'];
  body: RequestBody;
  hostname: URL['hostname'];
  port: URL['port'];
};

const getBody = async (
  req: IsomorphicRequest,
): Promise<RequestBody | null> => {
  let json = null;

  if (req.headers.get('accept')?.includes('json')) {
    try {
      json = await req.json();
    } catch (err) {
      // Not JSON

      return null;
    }
  }

  return json ?? req.text();
};

export const parseRequest = async (
  req: IsomorphicRequest,
): Promise<InterceptedRequest> => ({
  method: req.method,
  pathname: req.url.pathname,
  query: req.url.search,
  body: await getBody(req),
  hostname: req.url.hostname,
  port: req.url.port,
});
