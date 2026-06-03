const appRoot = process.env.ACTIVEMIRROR_GENUI_ROOT || __dirname;
const port = process.env.PORT || "3456";
const instances = Number(process.env.ACTIVEMIRROR_GENUI_INSTANCES || 2);

module.exports = {
  apps: [
    {
      name: "activemirror-genui",
      cwd: appRoot,
      script: "node_modules/next/dist/bin/next",
      args: ["start", "-p", port, "--hostname", "127.0.0.1"],
      exec_mode: "cluster",
      instances,
      env: {
        NODE_ENV: "production",
        PORT: port,
      },
      autorestart: true,
      exp_backoff_restart_delay: 1000,
      kill_timeout: 10000,
      listen_timeout: 10000,
      max_memory_restart: process.env.ACTIVEMIRROR_GENUI_MAX_MEMORY || "768M",
      max_restarts: 10,
      min_uptime: "30s",
      time: true,
      watch: false,
    },
  ],
};
