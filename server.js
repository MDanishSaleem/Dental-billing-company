// Passenger (cPanel "Setup Node.js App") startup file for Next.js.
// Passenger requires the app to create an HTTP server and listen on the
// port/socket it provides via process.env.PORT. This boots Next.js in
// production mode using the build output in .next/ and the full node_modules.
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || "0.0.0.0";

const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      handle(req, res);
    }).listen(port, () => {
      console.log(`> Next.js ready on ${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start Next.js server:", err);
    process.exit(1);
  });
