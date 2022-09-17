import { OpenAPIObject } from 'openapi3-ts';
import { getCoverageResults } from '../src/coverage/results';

const docs: OpenAPIObject = {
  openapi: '3.0.0',
  info: {
    title: 'Test API',
    version: '1.2.3',
  },
  paths: {
    '/articles': {
      get: {
        operationId: 'getArticles',
        parameters: [
          {
            in: 'query',
            name: 'limit',
            schema: {
              minimum: 0,
              type: 'number',
            },
          },
          {
            in: 'query',
            name: 'offset',
            schema: {
              minimum: 0,
              type: 'number',
            },
          },
        ],
      },
      post: {
        operationId: 'createArticle',
      },
    },
    '/articles/{slug}': {
      get: {
        operationId: 'getArticle',
        parameters: [
          {
            in: 'path',
            name: 'slug',
            schema: {
              type: 'string',
            },
          },
        ],
      },
    },
    '/search': {
      get: {
        operationId: 'getArticle',
        parameters: [
          {
            in: 'query',
            name: 'filter',
            explode: true,
            style: 'deepObject',
            schema: {
              type: 'object',
              properties: {
                author: {
                  type: 'string',
                },
                rating: {
                  type: 'number',
                },
              },
            },
          },
        ],
      },
    },
  },
};

describe('Coverage', () => {
  it('returns the expected results when no requests were made', () => {
    const results = getCoverageResults(docs, []);

    expect(results.filter(({ covered }) => covered)).toEqual([]);
  });

  it('returns the expected results when a matching request was made', () => {
    const results = getCoverageResults(docs, [
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
    const results = getCoverageResults(docs, [
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
    const results = getCoverageResults(docs, [
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
