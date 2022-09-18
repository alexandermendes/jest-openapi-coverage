import fse from 'fs-extra';
import { storeRequests } from '../../src/request/io';

jest.mock('fs-extra');
jest
  .useFakeTimers()
  .setSystemTime(new Date('2020-01-01'));

describe('Request IO', () => {
  describe('storeRequests', () => {
    it('stores some requests', async () => {
      const requests = [
        {
          method: 'GET',
          pathname: '/endpoint',
          query: '?foo=bar',
          body: '',
          hostname: '127.0.0.1',
          port: '7000',
        },
        {
          method: 'POST',
          pathname: '/endpoint',
          query: '',
          body: 'hello world',
          hostname: '127.0.0.1',
          port: '7000',
        },
      ];

      await storeRequests('/coverage/openapi', requests);

      expect(fse.ensureDirSync).toHaveBeenCalledTimes(1);
      expect(fse.ensureDirSync).toHaveBeenCalledWith('/coverage/openapi');

      expect(fse.writeJsonSync).toHaveBeenCalledTimes(1);
      expect(fse.writeJsonSync).toHaveBeenCalledWith(
        '/coverage/openapi/requests-1577836800000.json',
        requests,
      );
    });

    it('does not write an empty requests file', async () => {
      await storeRequests('/coverage/openapi', []);

      expect(fse.ensureDirSync).not.toHaveBeenCalled();
      expect(fse.writeJsonSync).not.toHaveBeenCalled();
    });
  });
});
