/**
 * Browser-sync configuration
 * Serves static files and proxies WebSocket connections to Python backend
 */

const os = require('os');

/**
 * Get local network IP address
 */
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null; // No network IP found
}

const localIP = getLocalIP();

module.exports = {
  server: {
    baseDir: "./",
    middleware: function (req, res, next) {
      // Allow CORS for WebSocket
      res.setHeader('Access-Control-Allow-Origin', '*');
      next();
    }
  },
  files: [
    "**/*.html",
    "**/*.css", 
    "**/*.js",
    "!node_modules/**",
    "../game_engine/**/*.py"
  ],
  // Use local IP if available, otherwise listen on all interfaces
  // This will show the actual IP address instead of 0.0.0.0 in the output
  host: localIP || "0.0.0.0",
  port: 5501,
  open: true,
  notify: false,
  // Don't inject browser-sync script into WebSocket connections
  snippetOptions: {
    rule: {
      match: /<\/body>/i,
      fn: function (snippet, match) {
        return snippet + match;
      }
    }
  }
};

