# heresy

ReMoodle Monorepo

> sixth circle of hell

## Development

### Prerequisites

Make sure you have the following installed:

1. **Node.js (v20)** - Download it via [fnm](https://github.com/Schniz/fnm).

2. **pnpm (v9)** - Installation instructions on the [pnpm website](https://pnpm.io/installation).

3. **Redis** - Installation instructions can be found on the [Redis website](https://redis.io/download).

4. **MongoDB** - Installation guides are available on the [MongoDB official site](https://www.mongodb.com/docs/manual/installation/).

### Setting Up Redis

After installing Redis, you need to execute the following command.

```bash
redis-cli XGROUP CREATE stream:grade-change notifier $ MKSTREAM
```

This command creates a new consumer group named `notifier` for the stream `stream:grade-change` used in the backend for notifications.

### Creating a Telegram Bot

1. **Start a chat with BotFather**: Open your Telegram application and search for "@BotFather". Start a conversation with this bot.
2. **Create a new bot**: Send the `/newbot` command to BotFather and follow the instructions. You will need to choose a name and a username for your bot.
3. **Get the token**: After the bot is created, BotFather will provide a token. This token is what your software will use to send and receive messages from the Telegram API.

### Running the Setup Script

Before starting your development, run the setup script to configure environment variables:

```bash
node scripts/setup-env.cjs
```

Follow the prompts to enter the required variables such as the Telegram Bot Token and Telegram Bot Username.

## Install dependencies

```bash
pnpm install
```

## Run the application

```bash
pnpm run dev
```
