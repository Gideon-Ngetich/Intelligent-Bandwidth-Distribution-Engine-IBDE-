const cron = require('node-cron')
const Feature = require('../models/features.model.js')
const ClientProfile = require('../models/clientProfile.model.js')
const { login } = require('../context/routerAuth.js')

async function collectData() {
  let conn;

  try {
    // Connect to MikroTik
    conn = await login({
      host: process.env.MIKROTIK_HOST || '[fe80::a00:27ff:fe09:fcc%18]',
      port: Number(process.env.MIKROTIK_PORT) || 8728,
      user: process.env.MIKROTIK_USER || 'admin',
      password: process.env.MIKROTIK_PASS || 'admin',
    });
    console.log('✅ Connected to MikroTik');

    // Fetch data in parallel
    const [pppActive, queues, resources] = await Promise.all([
      conn.write(['/ppp/active/print']), // Use /ip/hotspot/active/print for Hotspot
      conn.write(['/queue/simple/print']),
      conn.write(['/system/resource/print']),
    ]);

    // Map SLA tiers from MongoDB
    const profiles = await ClientProfile.find({});
    const slaMap = new Map(profiles.map((p) => [p.pppoe_name, p.sla_tier]));

    // Build features array
    const features = pppActive.map((user) => {
      const queue = queues.find((q) => q.name === user.name || q.target.includes(user['.id']));
      const maxLimit = queue?.['max-limit'] || '0/0';
      return {
        timestamp: new Date(),
        user: user.name,
        bytes_in: parseInt(user['rx-bytes'] || '0', 10),
        bytes_out: parseInt(user['tx-bytes'] || '0', 10),
        current_limit: maxLimit,
        router_cpu: parseFloat(resources[0].cpu || '0'),
        router_mem: parseFloat(resources[0]['free-memory'] || '0'),
        sla_tier: slaMap.get(user.name) || 1,
        hour: new Date().getHours(),
        dow: new Date().getDay(),
      };
    });

    if (features.length > 0) {
      await Feature.insertMany(features);
      console.log(`📊 Collected ${features.length} features`);
    }
  } catch (error) {
    console.error('❌ Collector error:', error.message);
    // TODO: Log to file or monitoring service
  } finally {
    if (conn) {
      await conn.destroy();
      console.log('🔌 MikroTik connection closed');
    }
  }
}

// Schedule every 1 minute
cron.schedule('*/1 * * * *', collectData, {
  scheduled: true,
  timezone: 'Africa/Nairobi', // Adjust as needed
});
console.log('🕐 Collector scheduled (every 1 min)');

module.exports = { collectData };