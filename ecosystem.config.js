module.exports = {
  apps: [
    {
      name: "dental-billing",
      script: ".next/standalone/server.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};
