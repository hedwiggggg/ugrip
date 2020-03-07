const proxy = require('cors-anywhere');
const host = process.env.CORS_HOST || '0.0.0.0';
const port = process.env.CORS_PORT || 8080;

proxy.createServer({
    originWhitelist: [], // Allow all origins
    requireHeader: ['origin', 'x-requested-with'],
    removeHeaders: ['cookie', 'cookie2']
}).listen(port, host, () => {
    console.log('Running CORS Anywhere on ' + host + ':' + port);
});
