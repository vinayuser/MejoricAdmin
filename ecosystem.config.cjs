module.exports = {
  apps: [
    {
      name: "mejoric-admin",
      script: "server.js",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3003,
        VITE_APP_ENV: "production",
      },
    },
  ],
};
