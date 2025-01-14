const fs = require("node:fs");
const readline = require("node:readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function setEnvVar(filePath, varName, varValue) {
  const content = `${varName}=${varValue}\n`;
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
}

console.log("Please enter the required environment variables:");

rl.question("Enter Telegram Bot token: ", (telegramBotToken) => {
  rl.question(
    "Enter Telegram Bot username without @ e.g. remoodle_dev_bot: ",
    (telegramBotName) => {
      setEnvVar("apps/backend/.env", "TELEGRAM_BOT_TOKEN", telegramBotToken);
      setEnvVar(
        "apps/telegram-bot/.env",
        "TELEGRAM_BOT_TOKEN",
        telegramBotToken
      );
      setEnvVar(
        "apps/serverless/alert-worker/.dev.vars",
        "TELEGRAM_BOT_TOKEN",
        telegramBotToken
      );
      setEnvVar(
        "apps/frontend/.env.local",
        "VITE_TELEGRAM_BOT_NAME",
        telegramBotName
      );

      rl.close();
    }
  );
});

rl.on("close", () => {
  console.log("Environment setup complete.");
});
