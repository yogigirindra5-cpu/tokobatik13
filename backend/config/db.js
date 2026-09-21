const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("connect", () => {
  console.log("✅ Terhubung ke Neon PostgreSQL");
});

pool.on("error", (error) => {
  console.error("❌ PostgreSQL Pool Error:", error);
});

module.exports = pool;