const http = require("http");
const { Client } = require("pg");

const PORT = Number(process.env.PORT) || 3000;

const client = new Client({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "appdb",
  port: Number(process.env.DB_PORT) || 5432,
});

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Hello world!\n");
});

const shutdown = () => {
  server.close(() => {
    client.end().finally(() => process.exit(0));
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

client
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL successfully");
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err.message);
    process.exit(1);
  });
