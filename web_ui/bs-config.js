/**
 * Browser-sync configuration
 * Serves static files and proxies WebSocket connections to Python backend
 */

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
  port: 5500,
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

