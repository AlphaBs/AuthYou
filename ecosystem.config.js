module.exports = {
  apps: [{
    name: 'auth',
    script: 'app.js',

    // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
    exec_mode: 'cluster',
    instances: 1,
    autorestart: true,
    watch: false,
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/auth.log',
    time: true,
    kill_timeout: 2000,
    listen_timeout: 2000,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
