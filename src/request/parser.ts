import { InteractiveIsomorphicRequest } from '@mswjs/interceptors';

type RequestBody = null | Record<string, any> | string;

export type InterceptedRequest = {
  method: string;
  pathname: URL['pathname'];
  query: URL['search'];
  body: RequestBody;
};

const getBody = async (
  req: InteractiveIsomorphicRequest,
): Promise<RequestBody> => {
  if (!req.bodyUsed) {
    return null;
  }

  try {
    return req.json();
  } catch (err) {
    // Not JSON
  }

  return req.text();
};

export const parseRequest = async (req: InteractiveIsomorphicRequest) => ({
  method: req.method,
  pathname: req.url.pathname,
  query: req.url.search,
  body: await getBody(req),
});
