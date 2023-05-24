module.exports = {
  apps: [
    {
      name: 'git-webhook',
      cwd: '/git-webhook/dist',
      script: 'main.js',
      instances: 0,
      exec_mode: 'cluster',
      autorestart: true,
      merge_logs: true,
      watch: true,
      watch_delay: 1000,
      ignore_watch: ['cli.js', 'config/*', '*.ndjson'],
      user: 'user_web',
      output: '/var/log/pm2/git-webhook/out.log',
      error: '/var/log/pm2/git-webhook/error.log',
    },
  ],
};
