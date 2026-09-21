const pool = require("./config/db");

async function testDatabase() {
  try {
    const result = await pool.query(`
      SELECT NOW() AS waktu
    `);

    console.log("================================");
    console.log("✅ NEON BERHASIL TERHUBUNG");
    console.log("Waktu:", result.rows[0].waktu);
    console.log("================================");

    await pool.end();
  } catch (error) {
    console.error("❌ DATABASE ERROR");
    console.error(error.message);
  }
}

testDatabase();