module.exports = {
    apps: [
      {
        name: "start_site",
        script: "node_modules/.bin/next", // Użyj .bin zamiast dist/bin/next
        args: "start -p 59843",
        exec_mode: "fork",
        instances: 1,
        watch: true,
        autorestart: true,
        max_memory_restart: "350M",
        env: {
          NODE_ENV: "production"
        }
      }
    ]
  };
  
  