# jest-openapi-coverage

[![npm version](https://badge.fury.io/js/jest-openapi-coverage.svg)](https://badge.fury.io/js/jest-openapi-coverage)

Reports coverage based on [OpenAPI](https://swagger.io/specification/) specifications
for integration tests run using Jest.

It intercepts outgoing requests then reports coverage based on the OpenAPI
[paths and operations](https://swagger.io/docs/specification/paths-and-operations/)
that were run and the query parameters included.

## Installation

Install using npm:

```sh
npm install jest-openapi-coverage -D
```

Or yarn:

```sh
yarn install jest-openapi-coverage -D
```

## Usage

Create a file that will be passed to [`setupFilesAfterEnv`](https://jestjs.io/docs/configuration#setupfilesafterenv-array) (e.g. `jest.setup-after-env.js`) and add
the following contents:

```js
import 'jest-openapi-coverage/setup-after-env';
```

Add the following to your [Jest config](https://jestjs.io/docs/configuration):

```js
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup-after-env.js'],
  globalSetup: 'jest-openapi-coverage/global-setup',
  globalTeardown: 'jest-openapi-coverage/global-teardown',
};
```

You will also need to provide the OpenAPI docs that will be used to determine
coverage. This can be done via the [`docsPath`](#docspath) configuration option
or by loading it dynamically when your tests are running, for example:

```js
import fetch from 'node-fetch';
import { setupOpenApiDocs } from 'jest-openapi-coverage';

beforeAll(async () => {
  const res = await fetch('http://localhost:1234/docs.json');
  const docs = await res.json();

  setupOpenApiDocs(docs);
});
```

## Configuration

You can configure the coverage reporter by placing a file called
`jest-openapi-coverage.config.js|ts|cjs|json` in the root of your repository,
for example:

```js
const config = {
  format: ['json'],
  outputFile: 'oapi-coverage.json',
};

module.exports = config;
```

Or using TypeScript:

```ts
import { JestOpenApiCoverageConfig } from 'jest-openapi-coverage';

const config: JestOpenApiCoverageConfig = {
  format: ['json'],
  outputFile: 'oapi-coverage.json',
};

export default config;
```

The available configuration options are described below.

### `coverageDirectory`

Default: The value of `coverageDirectory` from the Jest config.

Specifically an alternative directory to store the coverage reports.

```js
module.exports = {
  coverageDirectory: '/path/to/coverage',
};
```

### `coverageThreshold`

Default: `undefined`

This will be used to configure minimum threshold enforcement for coverage results.

```js
module.exports = {
  coverageThreshold: {
    operations: 80,
    queryParameters: 80,
  },
};
```

### `docsPath`

Default: `undefined`

Specify the path to your JSON OpenAPI docs.

```js
module.exports = {
  docsPath: './path/to/docs.json',
};
```

### `enabled`

Default: The value of `collectCoverage` from the Jest config.

Specifically enable or disable coverage for all test runs.

```js
module.exports = {
  enabled: true,
};
```

### `format`

Default: `['table']`

Specify the output format(s). The options are `table` and `json`.

```js
module.exports = {
  format: ['table', 'json'],
};
```

### `outputFile`

Default: `undefined`

A path to the JSON report (applies only when the `format` is `json`).

```js
module.exports = {
  outputFile: './path/to/output.json',
};
```

### `server`

Default: `undefined`

The server to consider for intercepted requests. By default we consider requests
to `127.0.0.1` or `localhost` as being requests to your API. To target an
alternative server you can do something like the following:

```js
module.exports = {
  server: {
    hostname: 'example.com',
    port: 3000, // optional
  }
};
```

## Manual setup

If you already have Jest setup files that you want to reuse you can call the
relevant `jest-openapi-coverage` functions from those files directly instead,
for example:

### `globalSetup` file

```js
const { globalSetup } = require('jest-openapi-coverage');

module.exports = (globalSetup) => {
  globalSetup(globalSetup);
};
```

### `globalTeardown` file

```js
const { globalTeardown } = require('jest-openapi-coverage');

module.exports = () => {
  globalTeardown();
};
```

### `setupFilesAfterEnv` file

```js
const { requestInterceptor } = require('jest-openapi-coverage');

beforeAll(requestInterceptor.setup);
afterAll(requestInterceptor.teardown);
```
