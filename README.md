# heresy

ReMoodle Monorepo

> sixth circle of hell

## Development

### Prerequisites

Make sure you have the following installed:

1. **Node.js (v20)** - You'll need Node.js to run your JavaScript code. Download and install it from [Node.js official website](https://nodejs.org/).

2. **pnpm (v9)** - pnpm is a fast, disk space efficient package manager for JavaScript. Install pnpm by running:

   ```bash
   npm install -g pnpm@9
   ```

3. **Redis** - Redis is an in-memory data structure store used as a database, cache, and message broker. Installation instructions can be found on the [Redis website](https://redis.io/download).

4. **MongoDB** - MongoDB is a NoSQL database designed for ease of development and scaling. Installation guides are available on the [MongoDB official site](https://www.mongodb.com/docs/manual/installation/).

### Setting Up Redis

After installing Redis, you need to execute the following command to set up a stream for your application:

```bash
redis-cli XGROUP CREATE stream:grade-change notifier $ MKSTREAM
```

This command creates a new consumer group named `notifier` for the stream `stream:grade-change`.

### Creating a Telegram Bot

1. **Start a chat with BotFather**: Open your Telegram application and search for "@BotFather". Start a conversation with this bot.
2. **Create a new bot**: Send the `/newbot` command to BotFather and follow the instructions. You will need to choose a name and a username for your bot.
3. **Get the token**: After the bot is created, BotFather will provide a token. This token is what your software will use to send and receive messages from the Telegram API.

### Running the Setup Script

Before starting your development, run the setup script to configure environment variables:

```bash
node scripts/setup-env.cjs
```

Follow the prompts to enter the required variables such as the Telegram Bot Token.

### Development Instructions

With all dependencies installed and initial setup complete, you're ready to start developing. Use the following commands to run your development environment:

```bash
# Install dependencies
pnpm install

# Run entire application
pnpm run dev
```
