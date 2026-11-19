import { connect } from 'nats';
const { sendNatsMessage } = jest.requireActual<typeof import('./core')>('./core');

jest.mock('nats', () => ({
  connect: jest.fn(),
  JSONCodec: jest.fn(() => ({
    encode: jest.fn((message) => message),
  })),
}));

const mockConnect = connect as jest.MockedFunction<typeof connect>;

describe('sendNatsMessage', () => {
  const mockPublish = jest.fn();
  const mockDrain = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();

    mockConnect.mockResolvedValue({
      publish: mockPublish,
      drain: mockDrain,
    } as unknown as Awaited<ReturnType<typeof connect>>);
  });

  it('connects with username and password', async () => {
    await sendNatsMessage(
      'nats://localhost:4222',
      'test.subject',
      { test: true },
      { user: 'test-user', pass: 'test-password' },
    );

    expect(mockConnect).toHaveBeenCalledWith({
      servers: 'nats://localhost:4222',
      user: 'test-user',
      pass: 'test-password',
    });

    expect(mockPublish).toHaveBeenCalledWith('test.subject', { test: true });
    expect(mockDrain).toHaveBeenCalledTimes(1);
  });

  it('connects without authentication when credentials are not provided', async () => {
    await sendNatsMessage('nats://localhost:4222', 'test.subject', { test: true });

    expect(mockConnect).toHaveBeenCalledWith({
      servers: 'nats://localhost:4222',
    });
  });

  it.each([[{ user: 'test-user' }], [{ pass: 'test-password' }]])(
    'throws an error when credentials are incomplete: %p',
    async (credentials) => {
      await expect(
        sendNatsMessage('nats://localhost:4222', 'test.subject', { test: true }, credentials),
      ).rejects.toThrow('NATS username and password must both be provided');

      expect(mockConnect).not.toHaveBeenCalled();
    },
  );
});
