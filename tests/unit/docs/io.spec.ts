import fse from 'fs-extra';
import { readDocs, writeDocs } from '../../../src/docs/io';
import { openApiDocs } from '../../fixtures/openapi-docs';

jest.mock('fs-extra');

describe('Docs: IO', () => {
  describe('writeDocs', () => {
    it('writes docs from an object', async () => {
      await writeDocs('/coverage/openapi', openApiDocs);

      expect(fse.ensureDirSync).toHaveBeenCalledTimes(1);
      expect(fse.ensureDirSync).toHaveBeenCalledWith('/coverage/openapi');

      expect(fse.writeFileSync).toHaveBeenCalledTimes(1);
      expect(fse.writeFileSync).toHaveBeenCalledWith(
        '/coverage/openapi/docs.json',
        JSON.stringify(openApiDocs),
      );
    });

    it('writes docs from a JSON string', async () => {
      await writeDocs('/coverage/openapi', JSON.stringify(openApiDocs));

      expect(fse.ensureDirSync).toHaveBeenCalledTimes(1);
      expect(fse.ensureDirSync).toHaveBeenCalledWith('/coverage/openapi');

      expect(fse.writeFileSync).toHaveBeenCalledTimes(1);
      expect(fse.writeFileSync).toHaveBeenCalledWith(
        '/coverage/openapi/docs.json',
        JSON.stringify(openApiDocs),
      );
    });
  });

  describe('readDocs', () => {
    it('reads a docs.json file', async () => {
      (fse.existsSync as jest.Mock).mockReturnValue(true);
      (fse.readJSON as jest.Mock).mockResolvedValue(openApiDocs);

      const docs = await readDocs('/coverage/openapi');

      expect(docs).toEqual(openApiDocs);
      expect(fse.readJSON).toHaveBeenCalledTimes(1);
      expect(fse.readJSON).toHaveBeenCalledWith('/coverage/openapi/docs.json');
    });

    it('returns null if there is no docs.json file', async () => {
      (fse.existsSync as jest.Mock).mockReturnValue(false);

      const docs = await readDocs('/coverage/openapi');

      expect(docs).toBeNull();
      expect(fse.readJSON).not.toHaveBeenCalled();
    });
  });
});
