# heresy

> sixth circle of hell

## Development

### Prerequisites

Make sure you have the following installed:

1. **Node.js (v20)** - Download it via [fnm](https://github.com/Schniz/fnm).

2. **pnpm (v9)** - Installation instructions on the [pnpm website](https://pnpm.io/installation).

3. **Redis** - Installation instructions can be found on the [Redis website](https://redis.io/download).

4. **MongoDB** - Installation guides are available on the [MongoDB official site](https://www.mongodb.com/docs/manual/installation/).

### 1. Setting Up Redis

After installing Redis, you need to execute the following command.

```bash
redis-cli XGROUP CREATE stream:grade-change notifier $ MKSTREAM
```

This command creates a new consumer group named `notifier` for the stream `stream:grade-change` used in the backend for notifications.

### 2. Creating a Telegram Bot

To create a Telegram bot, chat with @BotFather on Telegram, follow his instructions to set up your TESTING bot, and obtain the API token he provides for integrating with the Telegram API.

:note Follow the ReMoodle::dev::<your-bot-username> guideline

### 3. Running the Setup Script

Before starting your development, run the setup script to configure environment variables:

```bash
node scripts/setup-env.cjs
```

Follow the prompts to enter the required variables such as the Telegram Bot Token and Telegram Bot Username.

### 4. Install dependencies

```bash
pnpm install
```

### 5. Run the application

### Make sure ReMoodle Core is running

Follow the instructions in the [core repository](https://github.com/remoodle/core).

:note

```bash
./rr serve --dotenv .env
```

### Run the application

```bash
pnpm run dev
```
