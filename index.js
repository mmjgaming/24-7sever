const mineflayer = require("mineflayer");

// 🔧 Safe config (Railway variables)
const config = {
  host: process.env.HOST,
  port: parseInt(process.env.MC_PORT) || 25565,
  username: process.env.USERNAME,
  password: process.env.PASSWORD
};

function createBot() {
  console.log("🚀 Starting bot...");
  console.log(`Connecting to: ${config.host}:${config.port}`);

  // 🧠 Create bot with safety
  let bot;

  try {
    bot = mineflayer.createBot({
      host: config.host,
      port: config.port,
      username: config.username,
      version: "1.20.1",
      auth: "offline"
    });
  } catch (err) {
    console.log("💥 Bot creation failed:", err.message);
    return setTimeout(createBot, 5000);
  }

  // ✅ Login event
  bot.on("login", () => {
    console.log("✅ Logged into server");
  });

  // 🎮 Spawn event
  bot.on("spawn", () => {
    console.log("🎮 Bot spawned");

    // 🧠 Anti-AFK (safe interval)
    const antiAfk = setInterval(() => {
      if (!bot.entity) return;

      bot.setControlState("forward", true);
      setTimeout(() => bot.setControlState("forward", false), 800);

      bot.setControlState("jump", true);
      setTimeout(() => bot.setControlState("jump", false), 400);
    }, 25000);

    // Cleanup on disconnect
    bot.on("end", () => clearInterval(antiAfk));
  });

  // 💬 Chat detection
  bot.on("messagestr", (msg) => {
    const text = msg.toLowerCase();
    console.log("📩", text);

    // 🔐 Register detection
    if (text.includes("register")) {
      bot.chat(`/register ${config.password} ${config.password}`);
      console.log("📌 Sent /register");
    }

    // 🔐 Login detection
    if (text.includes("login")) {
      bot.chat(`/login ${config.password}`);
      console.log("📌 Sent /login");
    }
  });

  // ❌ Kick handler
  bot.on("kicked", (reason) => {
    console.log("🚫 Kicked:", reason);
  });

  // ⚠️ Error handler
  bot.on("error", (err) => {
    console.log("⚠️ Error:", err.message);
  });

  // 🔁 Auto reconnect (safe)
  bot.on("end", () => {
    console.log("❌ Disconnected. Reconnecting in 5 seconds...");
    setTimeout(createBot, 5000);
  });
}

// 🚀 Start bot
createBot();


// 🌐 Railway keep-alive server
require("http")
  .createServer((req, res) => {
    res.writeHead(200);
    res.end("Bot is running");
  })
  .listen(process.env.PORT || 3000);
