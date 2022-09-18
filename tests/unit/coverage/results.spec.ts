import { ConcreteJestOpenApiCoverageConfig } from '../../../src/config/openapi';
import { getCoverageResults } from '../../../src/coverage/results';
import { InterceptedRequest } from '../../../src/request/parser';
import { openApiDocs } from '../../fixtures/openapi-docs';

const completeRequests: InterceptedRequest[] = [
  {
    method: 'get',
    pathname: '/articles',
    query: '?limit=1&offset=2',
    body: '',
    hostname: '127.0.0.1',
    port: '7000',
  },
  {
    method: 'post',
    pathname: '/articles',
    query: '',
    body: '',
    hostname: '127.0.0.1',
    port: '7000',
  },
  {
    method: 'get',
    pathname: '/articles/my-article',
    query: '',
    body: '',
    hostname: '127.0.0.1',
    port: '7000',
  },
  {
    method: 'get',
    pathname: '/search',
    query: '?filter[author]=joebloggs&filter[rating]=5',
    body: '',
    hostname: '127.0.0.1',
    port: '7000',
  },
  {
    method: 'get',
    pathname: '/settings',
    query: '',
    body: '',
    hostname: '127.0.0.1',
    port: '7000',
  },
];

const emptyOpenApiConfig = {} as ConcreteJestOpenApiCoverageConfig;

describe('Coverage', () => {
  describe('results', () => {
    it('returns the expected results when no requests were made', () => {
      const { results } = getCoverageResults(
        openApiDocs,
        [],
        emptyOpenApiConfig,
      );

      expect(results.filter(({ covered }) => covered)).toEqual([]);
    });

    it('returns the expected results when a matching request was made', () => {
      const { results } = getCoverageResults(
        openApiDocs,
        [
          {
            method: 'get',
            pathname: '/articles',
            query: '',
            body: '',
            hostname: '127.0.0.1',
            port: '7000',
          },
        ],
        emptyOpenApiConfig,
      );

      expect(results.filter(({ covered }) => covered)).toEqual([
        {
          path: '/articles',
          method: 'get',
          covered: true,
          percentageOfQueriesCovered: 0,
          queryParams: [
            { name: 'limit', covered: false },
            { name: 'offset', covered: false },
          ],
        },
      ]);
    });

    it('returns the expected results when only some query params were matched', () => {
      const { results } = getCoverageResults(openApiDocs, [
        {
          method: 'get',
          pathname: '/articles',
          query: '?limit=1',
          body: '',
          hostname: '127.0.0.1',
          port: '7000',
        },
        {
          method: 'get',
          pathname: '/search',
          query: '?filter[rating]=5',
          body: '',
          hostname: '127.0.0.1',
          port: '7000',
        },
      ], emptyOpenApiConfig);

      expect(results.filter(({ covered }) => covered)).toEqual([
        {
          path: '/articles',
          method: 'get',
          covered: true,
          percentageOfQueriesCovered: 50,
          queryParams: [
            { name: 'limit', covered: true },
            { name: 'offset', covered: false },
          ],
        },
        {
          path: '/search',
          method: 'get',
          covered: true,
          percentageOfQueriesCovered: 50,
          queryParams: [
            { name: 'filter[author]', covered: false },
            { name: 'filter[rating]', covered: true },
          ],
        },
      ]);
    });

    it('returns the expected results when all requests and query params were matched', () => {
      const { results } = getCoverageResults(
        openApiDocs,
        completeRequests,
        emptyOpenApiConfig,
      );

      expect(results.filter(({ covered }) => covered)).toEqual([
        {
          path: '/articles',
          method: 'get',
          covered: true,
          percentageOfQueriesCovered: 100,
          queryParams: [
            { name: 'limit', covered: true },
            { name: 'offset', covered: true },
          ],
        },
        {
          path: '/articles',
          method: 'post',
          covered: true,
          percentageOfQueriesCovered: 100,
          queryParams: [],
        },
        {
          path: '/articles/{slug}',
          method: 'get',
          covered: true,
          percentageOfQueriesCovered: 100,
          queryParams: [],
        },
        {
          path: '/search',
          method: 'get',
          covered: true,
          percentageOfQueriesCovered: 100,
          queryParams: [
            { name: 'filter[author]', covered: true },
            { name: 'filter[rating]', covered: true },
          ],
        },
        {
          path: '/settings',
          method: 'get',
          covered: true,
          percentageOfQueriesCovered: 100,
          queryParams: [],
        },
      ]);
    });

    it('ignores an irrelevant request', () => {
      const { results } = getCoverageResults(openApiDocs, [
        {
          method: 'get',
          pathname: '/irrelevant',
          query: '',
          body: '',
          hostname: '127.0.0.1',
          port: '7000',
        },
      ], emptyOpenApiConfig);

      expect(results.filter(({ covered }) => covered)).toEqual([]);
    });

    it('considers any path segement in the main servers object', () => {
      const { results } = getCoverageResults({
        ...openApiDocs,
        servers: [
          { url: 'http://127.0.0.1:7000/base' },
        ],
      }, [
        {
          method: 'get',
          pathname: '/base/articles',
          query: '',
          body: '',
          hostname: '127.0.0.1',
          port: '7000',
        },
      ], emptyOpenApiConfig);

      expect(results.filter(({ covered }) => covered)).toEqual([
        {
          path: '/articles',
          method: 'get',
          covered: true,
          percentageOfQueriesCovered: 0,
          queryParams: [
            { name: 'limit', covered: false },
            { name: 'offset', covered: false },
          ],
        },
      ]);
    });

    it('considers any path segement in the operation servers object', () => {
      const { results } = getCoverageResults({
        ...openApiDocs,
        paths: {
          '/specific': {
            get: {
              servers: [
                { url: 'http://127.0.0.1:7000/base' },
              ],
            },
          },
        },
      }, [
        {
          method: 'get',
          pathname: '/base/specific',
          query: '',
          body: '',
          hostname: '127.0.0.1',
          port: '7000',
        },
      ], emptyOpenApiConfig);

      expect(results.filter(({ covered }) => covered)).toEqual([
        {
          path: '/specific',
          method: 'get',
          covered: true,
          percentageOfQueriesCovered: 100,
          queryParams: [],
        },
      ]);
    });

    it('ignores an invalid operation', () => {
      const { results } = getCoverageResults({
        ...openApiDocs,
        paths: {
          ...openApiDocs.paths,
          '/bad': null,
          '/also-bad': {
            get: null,
          },
        },
      }, [
        {
          method: 'get',
          pathname: '/bad',
          query: '',
          body: '',
          hostname: '127.0.0.1',
          port: '7000',
        },
      ], emptyOpenApiConfig);

      expect(results.filter(({ covered }) => covered)).toEqual([]);
    });

    it.each([
      undefined,
      {},
      { $ref: '#/components/schemas/Thing' },
    ])('does not consider an object deep with the schema %s', (schema) => {
      const { results } = getCoverageResults({
        ...openApiDocs,
        paths: {
          '/deep': {
            get: {
              parameters: [
                {
                  in: 'query',
                  style: 'deepObject',
                  name: 'deep',
                  schema,
                },
              ],
            },
          },
        },
      }, [
        {
          method: 'get',
          pathname: '/deep',
          query: '',
          body: '',
          hostname: '127.0.0.1',
          port: '7000',
        },
      ], emptyOpenApiConfig);

      expect(results.filter(({ covered }) => covered)).toEqual([
        {
          path: '/deep',
          method: 'get',
          covered: true,
          percentageOfQueriesCovered: 0,
          queryParams: [
            { covered: false, name: 'deep' },
          ],
        },
      ]);
    });

    it('ignores requests to some unknown host', () => {
      const { results } = getCoverageResults(openApiDocs, [
        {
          method: 'get',
          pathname: '/articles',
          query: '',
          body: '',
          hostname: 'example.com',
          port: '7000',
        },
      ], emptyOpenApiConfig);

      expect(results.filter(({ covered }) => covered)).toHaveLength(0);
    });

    it('considers requests to some alternative port on localhost', () => {
      const { results } = getCoverageResults(openApiDocs, [
        {
          method: 'get',
          pathname: '/articles',
          query: '',
          body: '',
          hostname: 'localhost',
          port: '5000',
        },
      ], emptyOpenApiConfig);

      expect(results.filter(({ covered }) => covered)).toHaveLength(1);
    });

    it('considers requests to a host defined in the config', () => {
      const { results } = getCoverageResults(openApiDocs, [
        {
          method: 'get',
          pathname: '/articles',
          query: '',
          body: '',
          hostname: 'example.com',
          port: '5000',
        },
      ], {
        server: {
          hostname: 'example.com',
        },
      } as ConcreteJestOpenApiCoverageConfig);

      expect(results.filter(({ covered }) => covered)).toHaveLength(1);
    });

    it('considers requests to a host and port defined in the config', () => {
      const { results } = getCoverageResults(openApiDocs, [
        {
          method: 'get',
          pathname: '/articles',
          query: '',
          body: '',
          hostname: 'example.com',
          port: '5000',
        },
      ], {
        server: {
          hostname: 'example.com',
          port: 5000,
        },
      } as ConcreteJestOpenApiCoverageConfig);

      expect(results.filter(({ covered }) => covered)).toHaveLength(1);
    });

    it('ignores requests if the port defined in the config does not match', () => {
      const { results } = getCoverageResults(openApiDocs, [
        {
          method: 'get',
          pathname: '/articles',
          query: '',
          body: '',
          hostname: 'example.com',
          port: '5000',
        },
      ], {
        server: {
          hostname: 'example.com',
          port: 3000,
        },
      } as ConcreteJestOpenApiCoverageConfig);

      expect(results.filter(({ covered }) => covered)).toHaveLength(0);
    });

    it('decodes any URL-encoded query params', () => {
      const { results } = getCoverageResults(openApiDocs, [
        {
          method: 'get',
          pathname: '/search',
          query: '?filter%5Bauthor%5D=joebloggs&filter%5Brating%5D=5',
          body: '',
          hostname: '127.0.0.1',
          port: '7000',
        },
      ], emptyOpenApiConfig);

      expect(results.filter(({ covered }) => covered)).toEqual([
        {
          path: '/search',
          method: 'get',
          covered: true,
          percentageOfQueriesCovered: 100,
          queryParams: [
            { name: 'filter[author]', covered: true },
            { name: 'filter[rating]', covered: true },
          ],
        },
      ]);
    });
  });

  describe('totals', () => {
    it('returns the totals for no requests', () => {
      const { totals } = getCoverageResults(openApiDocs, [], emptyOpenApiConfig);

      expect(totals.operations).toBe(0);
      expect(totals.queryParameters).toBe(0);
    });

    it('returns the totals for a matching operation', () => {
      const { totals } = getCoverageResults(openApiDocs, [
        {
          method: 'get',
          pathname: '/articles',
          query: '',
          body: '',
          hostname: '127.0.0.1',
          port: '7000',
        },
      ], emptyOpenApiConfig);

      expect(totals.operations).toBe(20);
      expect(totals.queryParameters).toBe(0);
    });

    it('returns the totals for a matching operation with query params', () => {
      const { totals } = getCoverageResults(openApiDocs, [
        {
          method: 'get',
          pathname: '/articles',
          query: '?limit=1&offset=2',
          body: '',
          hostname: '127.0.0.1',
          port: '7000',
        },
      ], emptyOpenApiConfig);

      expect(totals.operations).toBe(20);
      expect(totals.queryParameters).toBe(50);
    });

    it('returns the totals for all matching query params', () => {
      const { totals } = getCoverageResults(openApiDocs, [
        {
          method: 'get',
          pathname: '/articles',
          query: '?limit=1&offset=2',
          body: '',
          hostname: '127.0.0.1',
          port: '7000',
        },
        {
          method: 'get',
          pathname: '/search',
          query: '?filter[author]=joebloggs&filter[rating]=5',
          body: '',
          hostname: '127.0.0.1',
          port: '7000',
        },
      ], emptyOpenApiConfig);

      expect(totals.operations).toBe(40);
      expect(totals.queryParameters).toBe(100);
    });

    it('returns the totals for all matching operations and query params', () => {
      const { totals } = getCoverageResults(
        openApiDocs,
        completeRequests,
        emptyOpenApiConfig,
      );

      expect(totals.operations).toBe(100);
      expect(totals.queryParameters).toBe(100);
    });
  });
});
