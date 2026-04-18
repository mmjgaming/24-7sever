const mineflayer = require("mineflayer");

// ✅ STRICT ENV CONFIG (no random values)
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
  if (botRunning) {
    console.log("⚠️ Bot already running, skipping...");
    return;
  }

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
      version: "1.21.1",
      auth: "offline"
    });
  } catch (err) {
    console.log("💥 Creation failed:", err.message);
    botRunning = false;
    return setTimeout(createBot, 30000);
  }

  // ✅ LOGIN
  bot.on("login", () => {
    console.log("✅ Logged in");
  });

  // 🎮 SPAWN
  bot.on("spawn", () => {
    console.log("🎮 Spawned");
  });

  // 💬 AUTH SYSTEM
  bot.on("messagestr", (msg) => {
    const text = msg.toLowerCase();
    console.log("📩", text);

    if (!authed && text.includes("register")) {
      setTimeout(() => {
        bot.chat(`/register ${config.password} ${config.password}`);
        console.log("📌 /register sent");
      }, 4000);
    }

    if (!authed && text.includes("login")) {
      setTimeout(() => {
        bot.chat(`/login ${config.password}`);
        console.log("📌 /login sent");
      }, 4000);
    }

    if (
      text.includes("logged in") ||
      text.includes("successfully") ||
      text.includes("welcome")
    ) {
      if (!authed) {
        authed = true;
        console.log("✅ AUTH COMPLETE");
        startAfk();
      }
    }
  });

  // 🧠 AFK SYSTEM
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

  // ❌ KICKED
  bot.on("kicked", (reason) => {
    console.log("🚫 Kicked:", reason);
  });

  // ⚠️ ERROR
  bot.on("error", (err) => {
    console.log("⚠️ Error:", err.message);
  });

  // 🔁 CLEAN DISCONNECT + SAFE RECONNECT
  bot.on("end", () => {
    console.log("❌ Disconnected");

    botRunning = false;
    authed = false;

    // ✅ ensure old session is CLOSED
    if (bot) {
      try {
        bot.removeAllListeners();
        bot.quit();
      } catch (e) {}
    }

    bot = null;

    if (reconnecting) return;
    reconnecting = true;

    const delay = 45000; // ⏱️ longer delay = prevents duplicate session

    console.log(`🔁 Reconnecting in ${delay / 1000}s...`);

    setTimeout(() => {
      reconnecting = false;
      createBot();
    }, delay);
  });
}

// 🚀 START (important delay)
setTimeout(createBot, 20000);

// 🌐 KEEP RAILWAY ALIVE
require("http")
  .createServer((req, res) => {
    res.writeHead(200);
    res.end("Bot is running");
  })
  .listen(process.env.PORT || 3000);
