import { getCoverageResults } from '../../src/coverage/results';
import { openApiDocs } from '../fixtures/openapi-docs';

describe('Coverage', () => {
  it('returns the expected results when no requests were made', () => {
    const results = getCoverageResults(openApiDocs, []);

    expect(results.filter(({ covered }) => covered)).toEqual([]);
  });

  it('returns the expected results when a matching request was made', () => {
    const results = getCoverageResults(openApiDocs, [
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
    const results = getCoverageResults(openApiDocs, [
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
    const results = getCoverageResults(openApiDocs, [
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
    ]);

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
    ]);
  });
});
