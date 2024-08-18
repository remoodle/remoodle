import http from "http";

export function createServer() {
  const server = http.createServer((req, res) => {
    if (req.url === "/health") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain");

      return res.end("OK");
    }

    res.statusCode = 404;
    res.end();
  });

  return server;
}
