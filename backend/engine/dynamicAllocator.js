const MikroTikClient = require('../mikrotik/client');
const BandwidthRule = require('../models/ruleSchema');
const TrafficLog = require('../models/trafficLogs');

class DynamicAllocator {
  constructor() {
    this.mikroTik = new MikroTikClient();
  }

  async analyzeAndAllocate(clientType = 'pppoe') {
    await this.mikroTik.connect();
    const stats = await this.mikroTik.getClientStats(clientType);
    const rules = await BandwidthRule.find({ clientType });

    for (const stat of stats) {
      const clientId = stat.name || stat['.id'];
      const rx = parseInt(stat['rx-byte'] || 0);
      const tx = parseInt(stat['tx-byte'] || 0);
      const total = rx + tx;
      const utilization = this.calculateUtilization(total);

      const rule = rules.find(r => this.isPeakTime(r.timeOfDay) && utilization > r.loadThreshold);
      const limitAt = rule ? rule.baseLimitAt * 0.7 : rules[0]?.baseLimitAt;
      const maxLimit = rule ? rule.baseMaxLimit * 1.2 : rules[0]?.baseMaxLimit;

      await this.mikroTik.setQueue(clientId, limitAt, maxLimit, rule?.priority);

      await new TrafficLog({ clientId, rxBytes: rx, txBytes: tx, utilization }).save();
    }
  }

  calculateUtilization(totalBytes) {
    return Math.min(100, (totalBytes / (1024 * 1024 * 0.06)) * 100);
  }

  isPeakTime(timeRange) {
    if (!timeRange) return false;
    const now = new Date();
    const [start, end] = timeRange.split('-');
    return now.getHours() >= parseInt(start.split(':')[0]) && now.getHours() <= parseInt(end.split(':')[0]);
  }
}

module.exports = DynamicAllocator;