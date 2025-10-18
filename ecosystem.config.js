module.exports = {
  apps: [
    {
      name: 'jadapi-server',
    cwd: '/home/ubuntu/Jadapi/apps/server',
      script: 'dist/server.js',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 4001,
      },
  error_file: '/home/ubuntu/Jadapi/logs/server-error.log',
  out_file: '/home/ubuntu/Jadapi/logs/server-out.log',
  log_file: '/home/ubuntu/Jadapi/logs/server-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 3000,
      kill_timeout: 5000,
    },
  ],
};
