const mineflayer = require("mineflayer");

const config = {
  host: "yourserver.aternos.me",
  port: 25565,
  username: "AFK_Bot_1",
  password: "123456"
};

function startBot() {
  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: false
  });

  bot.on("spawn", () => {
    console.log("✅ Bot joined");

    // Anti AFK (movement)
    setInterval(() => {
      bot.setControlState("forward", true);
      setTimeout(() => bot.setControlState("forward", false), 1000);
    }, 20000);
  });

  bot.on("message", (msg) => {
    const text = msg.toString().toLowerCase();
    console.log(text);

    // 🔐 Detect register
    if (
      text.includes("register") ||
      text.includes("/register")
    ) {
      bot.chat(`/register ${config.password} ${config.password}`);
      console.log("📌 Register command sent");
    }

    // 🔐 Detect login
    if (
      text.includes("login") ||
      text.includes("/login")
    ) {
      bot.chat(`/login ${config.password}`);
      console.log("📌 Login command sent");
    }
  });

  bot.on("end", () => {
    console.log("❌ Disconnected... reconnecting in 5s");
    setTimeout(startBot, 5000);
  });

  bot.on("error", (err) => {
    console.log("⚠️ Error:", err.message);
  });
}

startBot();

// Keep Railway alive (IMPORTANT)
require("http")
  .createServer((req, res) => {
    res.end("Bot running");
  })
  .listen(process.env.PORT || 3000);