import { IsomorphicRequest } from '@mswjs/interceptors';
import { parseRequest } from '../../src/request/parser';

const getArrayBuffer = (array: Uint8Array): ArrayBuffer => array
  .buffer
  .slice(
    array.byteOffset,
    array.byteOffset + array.byteLength,
  );

const encodeBuffer = (text: string): ArrayBuffer => {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(text);

  return getArrayBuffer(encoded);
};

describe('Request Parser', () => {
  it('parses a GET request', async () => {
    const request = new IsomorphicRequest(
      new URL('http://127.0.0.1:7000/endpoint?foo=bar'),
    );

    expect(await parseRequest(request)).toEqual({
      method: 'GET',
      pathname: '/endpoint',
      query: '?foo=bar',
      body: '',
      hostname: '127.0.0.1',
      port: '7000',
    });
  });

  it('parses a POST request with a text body', async () => {
    const request = new IsomorphicRequest(
      new URL('http://127.0.0.1:7000/endpoint'),
      {
        method: 'POST',
        body: encodeBuffer('hello world'),
      },
    );

    expect(await parseRequest(request)).toEqual({
      method: 'POST',
      pathname: '/endpoint',
      query: '',
      body: 'hello world',
      hostname: '127.0.0.1',
      port: '7000',
    });
  });

  it('parses a JSON body from a JSON request', async () => {
    const request = new IsomorphicRequest(
      new URL('http://127.0.0.1:7000/endpoint'),
      {
        method: 'PUT',
        body: encodeBuffer(JSON.stringify({ hello: 'world' })),
        headers: { Accept: 'application/json' },
      },
    );

    expect((await parseRequest(request)).body).toEqual({
      hello: 'world',
    });
  });

  it('parses a JSON body from a JSON-LD request', async () => {
    const request = new IsomorphicRequest(
      new URL('http://127.0.0.1:7000/endpoint'),
      {
        method: 'PUT',
        body: encodeBuffer(JSON.stringify({ hello: 'world' })),
        headers: { accept: 'application/json+ld' },
      },
    );

    expect((await parseRequest(request)).body).toEqual({
      hello: 'world',
    });
  });

  it('handles an invalid JSON response', async () => {
    const request = new IsomorphicRequest(
      new URL('http://127.0.0.1:7000/endpoint'),
      {
        method: 'PUT',
        body: encodeBuffer('not json'),
        headers: { Accept: 'application/json' },
      },
    );

    expect((await parseRequest(request)).body).toBeNull();
  });
});
