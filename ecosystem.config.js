module.exports = {
  apps: [
    {
      name: 'fileshift-server',
      cwd: '/home/ubuntu/fileshift/apps/server',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
      },
      env_file: '/home/ubuntu/fileshift/.env',
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/home/ubuntu/fileshift/logs/server-error.log',
      out_file: '/home/ubuntu/fileshift/logs/server-out.log',
    },
    {
      name: 'fileshift-web',
      cwd: '/home/ubuntu/fileshift/apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/home/ubuntu/fileshift/logs/web-error.log',
      out_file: '/home/ubuntu/fileshift/logs/web-out.log',
    },
  ],
};
