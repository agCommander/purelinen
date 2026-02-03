module.exports = {
  apps: [
    {
      name: 'purelinen-backend',
      script: 'npm',
      args: 'start',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 9000,
        DATABASE_URL: 'postgres://medusa_user:x2X%216BubaYdZ4%26DrvP%23l@127.0.0.1:5432/purelinen_medusa',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git'],
    },
  ],
}
