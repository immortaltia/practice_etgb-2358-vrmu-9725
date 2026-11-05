const http = require("http");
const { Client } = require("pg");

const PORT = 3000;

const client = new Client({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "appdb",
  port: 5432,
});

client
  .connect()
  .then(() => console.log("Connected to PostgreSQL successfully"))
  .catch((err) => {
    console.error("Database connection error:", err.message);
    process.exit(1);
  });

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Hello world!\n");
});

server.listen(PORT, () => {
  console.log(`Hello world! Server is running on port ${PORT}`);
});
