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
coverage, either via the configuration file (see below) or by loading it
dynamically when your tests are running, for example:

```js
import fetch from 'node-fetch';
import { writeDocs } from 'jest-openapi-coverage';

beforeAll(async () => {
  const res = await fetch('http://localhost:1234/docs.json');
  const docs = await res.json();

  writeDocs(docs);
});
```

## Configuration

TODO!

## Manual setup

If you already have Jest setup files that you want to reuse you can call the
relevant `jest-openapi-coverage` functions from those files directly instead,
for example:

#### `globalSetup` file

```js
const { globalSetup } = require('jest-openapi-coverage');

module.exports = () => {
  globalSetup();
};
```

#### `globalTeardown` file

```js
const { globalTeardown } = require('jest-openapi-coverage');

module.exports = () => {
  globalTeardown();
};
```

#### `setupFilesAfterEnv` file

```js
const { requestInterceptor } = require('jest-openapi-coverage');

beforeAll(requestInterceptor.setup);
afterAll(requestInterceptor.teardown);
```
