const mineflayer = require("mineflayer");

const config = {
  host: process.env.HOST,
  port: parseInt(process.env.MC_PORT) || 25565,
  username: process.env.USERNAME,
  password: process.env.PASSWORD
};

if (!config.host || !config.username) {
  console.log("❌ Missing ENV variables (HOST / USERNAME)");
  process.exit(1);
}

let bot = null;
let botRunning = false;
let reconnecting = false;
let authed = false;

function createBot() {
  if (botRunning) return;

  botRunning = true;
  authed = false;

  console.log("🚀 Starting bot...");
  console.log(`🌐 ${config.host}:${config.port}`);
  console.log(`👤 Username: ${config.username}`);

  try {
    bot = mineflayer.createBot({
      host: config.host,
      port: config.port,
      username: config.username,
      auth: "offline"
      // ❌ removed version (auto detect)
    });
  } catch (err) {
    console.log("💥 Creation failed:", err.message);
    botRunning = false;
    return setTimeout(createBot, 30000);
  }

  bot.on("login", () => {
    console.log("✅ Logged in");
  });

  bot.on("spawn", () => {
    console.log("🎮 Spawned");
  });

  bot.on("messagestr", (msg) => {
    const text = msg.toLowerCase();
    console.log("📩", text);

    if (!authed && text.includes("register")) {
      setTimeout(() => {
        bot.chat(`/register ${config.password} ${config.password}`);
      }, 4000);
    }

    if (!authed && text.includes("login")) {
      setTimeout(() => {
        bot.chat(`/login ${config.password}`);
      }, 4000);
    }

    if (
      text.includes("logged in") ||
      text.includes("welcome") ||
      text.includes("success")
    ) {
      if (!authed) {
        authed = true;
        console.log("✅ AUTH COMPLETE");
        startAfk();
      }
    }
  });

  function startAfk() {
    console.log("🚶 AFK started");

    setInterval(() => {
      if (!bot || !bot.entity) return;

      bot.setControlState("jump", true);
      setTimeout(() => bot.setControlState("jump", false), 400);

      bot.setControlState("forward", true);
      setTimeout(() => bot.setControlState("forward", false), 800);
    }, 30000);
  }

  bot.on("kicked", (reason) => {
    console.log("🚫 Kicked:", reason);
  });

  bot.on("error", (err) => {
    console.log("⚠️ Error:", err.message);
  });

  bot.on("end", () => {
    console.log("❌ Disconnected");

    botRunning = false;
    authed = false;

    try {
      if (bot) {
        bot.removeAllListeners();
        bot.quit();
      }
    } catch (e) {}

    bot = null;

    if (reconnecting) return;
    reconnecting = true;

    const delay = 45000;

    console.log(`🔁 Reconnecting in ${delay / 10}s...`);

    setTimeout(() => {
      reconnecting = false;
      createBot();
    }, delay);
  });
}

setTimeout(createBot, 15000);

// keep alive
require("http")
  .createServer((req, res) => {
    res.end("Bot is running");
  })
  .listen(process.env.PORT || 3000);
