# jest-openapi-coverage

[![npm version](https://badge.fury.io/js/jest-openapi-coverage.svg)](https://badge.fury.io/js/jest-openapi-coverage)

Reports coverage based on [OpenAPI](https://swagger.io/specification/) specifications.

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
};
```

### Manual setup

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
