import { OpenAPIObject } from 'openapi3-ts';

export const openApiDocs: OpenAPIObject = {
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
        operationId: 'search',
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
    '/settings': {
      get: {
        operationId: 'getSettings',
      },
    },
  },
};
