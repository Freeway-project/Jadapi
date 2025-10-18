import os from 'os';

export class SystemStatsService {
  static getStats() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    return {
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0].model,
        loadAvg: os.loadavg(),
      },
      memory: {
        total: this.formatBytes(totalMemory),
        free: this.formatBytes(freeMemory),
        used: this.formatBytes(usedMemory),
        usedPercentage: ((usedMemory / totalMemory) * 100).toFixed(2),
      },
      os: {
        platform: os.platform(),
        type: os.type(),
        release: os.release(),
        arch: os.arch(),
      },
      uptime: {
        system: this.formatUptime(os.uptime()),
        process: this.formatUptime(process.uptime()),
      }
    };
  }

  private static formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  private static formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);

    return parts.join(' ');
  }
}