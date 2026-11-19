import { AttachmentCleaner } from './AttachmentCleaner';
import { QetaStore } from '../database/QetaStore';
import { mockServices } from '@backstage/backend-test-utils';

describe('AttachmentCleaner', () => {
  const config = mockServices.rootConfig();
  const logger = mockServices.logger.mock();
  const discovery = mockServices.discovery();
  const auth = mockServices.auth();
  const attachments = [{ uuid: 'one' }, { uuid: 'two' }];
  let database: QetaStore;
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    database = {
      getDeletableAttachments: jest.fn().mockResolvedValue(attachments),
    } as unknown as QetaStore;
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue({ ok: true } as Response);
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  it('deletes all deletable attachments', async () => {
    await AttachmentCleaner.cleanAttachments(
      config,
      logger,
      database,
      discovery,
      auth,
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('stops deleting attachments when aborted and passes the signal to fetch', async () => {
    const controller = new AbortController();
    fetchMock.mockImplementation(async () => {
      controller.abort();
      return { ok: true } as Response;
    });

    await AttachmentCleaner.cleanAttachments(
      config,
      logger,
      database,
      discovery,
      auth,
      controller.signal,
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].signal).toBe(controller.signal);
    expect(logger.warn).toHaveBeenCalledWith('Attachment cleaning aborted');
  });
});
