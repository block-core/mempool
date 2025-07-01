// Simplified proxy configuration without external config file dependency
const PROXY_CONFIG = [
  {
    context: [
      '/api/**', '!/api/v1/ws',
      '!/liquid', '!/liquid/**', '!/liquid/',
      '!/liquidtestnet', '!/liquidtestnet/**', '!/liquidtestnet/'
    ],
    target: "http://localhost:8999",
    ws: true,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  },
  {
    context: ['/api/v1/ws'],
    target: "http://localhost:8999",
    ws: true,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  },
  {
    context: ['/api/liquid**', '/liquid/api/**'],
    target: "http://localhost:8999",
    pathRewrite: {
      "^/api/liquid/": "/api/v1/"
    },
    ws: true,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  },
  {
    context: ['/api/liquidtestnet**', '/liquidtestnet/api/**'],
    target: "http://localhost:8999",
    pathRewrite: {
      "^/api/liquidtestnet/": "/api/v1/",
      "^/liquidtestnet/api/": "/api/v1/"
    },
    ws: true,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  },
  {
    context: ['/resources/mining-pools/**'],
    target: "https://mempool.space",
    secure: false,
    changeOrigin: true
  },
  // Assets for liquid (since we're using liquid testnet)
  {
    context: [
      '/resources/assets.json', '/resources/assets.minimal.json',
      '/resources/assets-testnet.json', '/resources/assets-testnet.minimal.json'
    ],
    target: "https://liquid.network",
    secure: false,
    changeOrigin: true,
  }
];

module.exports = PROXY_CONFIG;