
const client = {
  query: jest.fn(),
  release: jest.fn(),
}

// jest.mock('pg', () => {
module.exports = {
  Pool: jest.fn(() => {
    return {
      connect: jest.fn().mockImplementation(() => {
        return client;
      }),
      query: jest.fn(),
      end: jest.fn(),
    }
  }),
};
