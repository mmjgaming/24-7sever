
const mineflayer = require("mineflayer");

const config = {
  host: process.env.HOST,
  port: parseInt(process.env.MC_PORT) || 25565,
  username: process.env.USERNAME,
  password: process.env.PASSWORD
};

let botRunning = false;
let reconnecting = false;

function createBot() {
  if (botRunning) {
    console.log("⚠️ Bot already running, skipping...");
    return;
  }

  botRunning = true;
  console.log("🚀 Starting bot...");
  console.log(Connecting to: ${config.host}:${config.port});

  let bot;
  let authed = false;

  try {
    bot = mineflayer.createBot({
      host: config.host,
      port: config.port,
      username: config.username,
      version: "1.21.1",
      auth: "offline"
    });
  } catch (err) {
    console.log("💥 Bot creation failed:", err.message);
    botRunning = false;
    return setTimeout(createBot, 10000);
  }

  // ✅ Login
  bot.on("login", () => {
    console.log("✅ Logged into server");
  });

  // 🎮 Spawn
  bot.on("spawn", () => {
    console.log("🎮 Spawned — waiting for login/register...");
  });

  // 💬 AUTH SYSTEM (FIXED)
  bot.on("messagestr", (msg) => {
    const text = msg.toLowerCase();
    console.log("📩", text);

    if (!authed && text.includes("register")) {
      setTimeout(() => {
        bot.chat(/register ${config.password} ${config.password});
        console.log("📌 Sent /register");
      }, 4000);
    }

    if (!authed && text.includes("login")) {
      setTimeout(() => {
        bot.chat(/login ${config.password});
        console.log("📌 Sent /login");
      }, 4000);
    }

    // ✅ detect successful login
    if (
      text.includes("logged in") ||
      text.includes("successfully") ||
      text.includes("welcome")
    ) {
      authed = true;
      console.log("✅ AUTH COMPLETE");

      startAfk(bot);
    }
  });

  // 🧠 AFK AFTER LOGIN ONLY
  function startAfk(bot) {
    console.log("🚶 Starting AFK system");

    setInterval(() => {
      if (!bot.entity) return;

      bot.setControlState("jump", true);
      setTimeout(() => bot.setControlState("jump", false), 400);

      bot.setControlState("forward", true);
      setTimeout(() => bot.setControlState("forward", false), 800);

    }, 30000);
  }

  // ❌ Kicked
  bot.on("kicked", (reason) => {
    console.log("🚫 Kicked:", reason);
  });

  // ⚠️ Error
  bot.on("error", (err) => {
    console.log("⚠️ Error:", err.message);
  });

  // 🔁 SAFE RECONNECT (NO SPAM)
  bot.on("end", () => {
    console.log("❌ Disconnected");

    botRunning = false;

    if (reconnecting) return;
    reconnecting = true;

    const delay = 15000; // 15 seconds

    console.log(🔁 Reconnecting in ${delay / 1000}s...);

    setTimeout(() => {
      reconnecting = false;
      createBot();
    }, delay);
  });
}

// 🚀 Start
setTimeout(createBot, 10000); // wait before first connect

// 🌐 Keep Railway alive
require("http")
  .createServer((req, res) => {
    res.writeHead(200);
    res.end("Bot is running");
  })
  .listen(process.env.PORT || 3000); 
