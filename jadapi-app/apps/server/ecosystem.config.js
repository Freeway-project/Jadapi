module.exports = {
  apps: [
    {
      name: 'jadapi-server',
      script: 'dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3001,
      },
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: './logs/pm2-err.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      watch: false,
    },
  ],
};