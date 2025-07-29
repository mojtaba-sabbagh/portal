const { createServer } = require('http');
const next = require('next');

const app = next({ dev: false });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer(handle).listen(PORT, () => {
    console.log(`Next.js server running on port ${PORT}`);
  });
});