import { getCoverageResults } from '../../src/coverage/results';
import { InterceptedRequest } from '../../src/request/parser';
import { openApiDocs } from '../fixtures/openapi-docs';

const completeRequests: InterceptedRequest[] = [
  {
    method: 'get',
    pathname: '/articles',
    query: '?limit=1&offset=2',
    body: '',
  },
  {
    method: 'post',
    pathname: '/articles',
    query: '',
    body: '',
  },
  {
    method: 'get',
    pathname: '/articles/my-article',
    query: '',
    body: '',
  },
  {
    method: 'get',
    pathname: '/search',
    query: '?filter[author]=joebloggs&filter[rating]=5',
    body: '',
  },
  {
    method: 'get',
    pathname: '/settings',
    query: '',
    body: '',
  },
];

describe('Coverage', () => {
  describe('results', () => {
    it('returns the expected results when no requests were made', () => {
      const { results } = getCoverageResults(openApiDocs, []);

      expect(results.filter(({ covered }) => covered)).toEqual([]);
    });

    it('returns the expected results when a matching request was made', () => {
      const { results } = getCoverageResults(openApiDocs, [
        {
          method: 'get',
          pathname: '/articles',
          query: '',
          body: '',
        },
      ]);

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
        },
        {
          method: 'get',
          pathname: '/search',
          query: '?filter[rating]=5',
          body: '',
        },
      ]);

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
      const { results } = getCoverageResults(openApiDocs, completeRequests);

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
        },
      ]);

      expect(results.filter(({ covered }) => covered)).toEqual([]);
    });

    it('considers any path segement in the main servers object', () => {
      const { results } = getCoverageResults({
        ...openApiDocs,
        servers: [
          { url: 'http://www.example.com/base' },
        ],
      }, [
        {
          method: 'get',
          pathname: '/base/articles',
          query: '',
          body: '',
        },
      ]);

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
                { url: 'http://www.example.com/base' },
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
        },
      ]);

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
        },
      ]);

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
        },
      ]);

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
  });

  describe('totals', () => {
    it('returns the totals for no requests', () => {
      const { totals } = getCoverageResults(openApiDocs, []);

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
        },
      ]);

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
        },
      ]);

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
        },
        {
          method: 'get',
          pathname: '/search',
          query: '?filter[author]=joebloggs&filter[rating]=5',
          body: '',
        },
      ]);

      expect(totals.operations).toBe(40);
      expect(totals.queryParameters).toBe(100);
    });

    it('returns the totals for all matching operations and query params', () => {
      const { totals } = getCoverageResults(openApiDocs, completeRequests);

      expect(totals.operations).toBe(100);
      expect(totals.queryParameters).toBe(100);
    });
  });
});
