const MikroNode = require('mikronode');
require('dotenv').config();

class MikroTikClient {
  constructor() {
    this.device = new MikroNode(process.env.MIKROTIK_HOST, parseInt(process.env.API_PORT));
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      const [login] = await Promise.race([
        this.device.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 3000)),
      ]);
      this.connection = await login(process.env.MIKROTIK_USER, process.env.MIKROTIK_PASS);
      this.channel = this.connection.openChannel();
      console.log(`Connected to MikroTik at ${process.env.MIKROTIK_HOST}:${process.env.API_PORT}`);
      return this.connection;
    } catch (error) {
      console.error('Connection error:', error.message);
      this.close(); // Ensure cleanup
      throw new Error(`Failed to connect to MikroTik: ${error.message}`);
    }
  }

  async getClientStats(clientType = 'pppoe') {
    if (!this.channel) throw new Error('Not connected');
    return new Promise((resolve, reject) => {
      this.channel.write(`/interface ${clientType === 'pppoe' ? 'pppoe-server' : 'hotspot'} print detail stats`);
      this.channel.on('done', (data) => resolve(data.data));
      this.channel.on('error', (err) => reject(err));
    });
  }

  async setQueue(clientId, limitAt, maxLimit, priority = 8) {
    if (!this.channel) throw new Error('Not connected');
    return new Promise((resolve, reject) => {
      this.channel.write([
        '/queue simple',
        `=add name=${clientId}-queue target=${clientId} max-limit=${maxLimit}k/${maxLimit}k limit-at=${limitAt}k/${limitAt}k priority=${priority} queue=default`,
      ]);
      this.channel.on('done', (data) => {
        console.log(`Queue updated for ${clientId}: ${limitAt}k/${maxLimit}k`);
        resolve(data);
      });
      this.channel.on('error', (err) => reject(err));
    });
  }

  async removeQueue(queueName) {
    if (!this.channel) throw new Error('Not connected');
    this.channel.write(['/queue simple/remove', `=.id=${queueName}`]);
  }

  close() {
    if (this.channel) this.channel.close();
    if (this.connection) this.connection.close();
    this.channel = null;
    this.connection = null;
  }
}

module.exports = MikroTikClient;