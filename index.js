const mineflayer = require("mineflayer");

// Read from Railway variables
const config = {
  host: process.env.HOST,
  port: parseInt(process.env.MC_PORT) || 25565,
  username: process.env.USERNAME,
  password: process.env.PASSWORD
};

function createBot() {
  console.log("🚀 Starting bot...");
  console.log("Connecting to:", config.host + ":" + config.port);

  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: "1.20.1"
  });

  // 🔌 Connected
  bot.on("login", () => {
    console.log("✅ Logged into server");
  });

  // 🎮 Spawned
  bot.on("spawn", () => {
    console.log("🎮 Bot spawned");

    // Anti AFK movement
    setInterval(() => {
      bot.setControlState("forward", true);
      setTimeout(() => bot.setControlState("forward", false), 1000);

      bot.setControlState("jump", true);
      setTimeout(() => bot.setControlState("jump", false), 500);
    }, 20000);
  });

  // 💬 Chat / system messages
  bot.on("message", (msg) => {
    const text = msg.toString().toLowerCase();
    console.log("📩", text);

    // Detect register
    if (text.includes("register")) {
      bot.chat(`/register ${config.password} ${config.password}`);
      console.log("📌 Sent /register");
    }

    // Detect login
    if (text.includes("login")) {
      bot.chat(`/login ${config.password}`);
      console.log("📌 Sent /login");
    }
  });

  // ❌ Kicked
  bot.on("kicked", (reason) => {
    console.log("🚫 Kicked:", reason);
  });

  // ⚠️ Error
  bot.on("error", (err) => {
    console.log("⚠️ Error:", err.message);
  });

  // 🔁 Reconnect
  bot.on("end", () => {
    console.log("❌ Disconnected. Reconnecting in 5 seconds...");
    setTimeout(createBot, 5000);
  });
}

// Start bot
createBot();


// 🌐 Keep Railway alive
require("http")
  .createServer((req, res) => {
    res.writeHead(200);
    res.end("Bot is running");
  })
  .listen(process.env.PORT || 3000);
