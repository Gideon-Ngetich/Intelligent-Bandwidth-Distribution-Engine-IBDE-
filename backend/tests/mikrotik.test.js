const MikroTikClient = require('../mikrotik/client');

describe('MikroTik Client', () => {
  let client;

  beforeAll(async () => {
    client = new MikroTikClient();
    await client.connect();
  }, 10000); // 10s timeout

  afterAll(async () => {
    if (client) client.close();
  });

  test('should connect to MikroTik', async () => {
    await expect(client.connect()).resolves.toBeDefined();
  }, 10000);

  test('should fetch PPPoE client stats', async () => {
    const stats = await client.getClientStats('pppoe');
    expect(Array.isArray(stats)).toBe(true);
  }, 10000);

  test('should set queue', async () => {
    const result = await client.setQueue('test-client', 512, 1024);
    expect(result).toBeDefined();
  }, 10000);
});