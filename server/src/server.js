require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");
const { seedDataIfNeeded } = require("./seed/seedData");

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    await seedDataIfNeeded();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

start();
