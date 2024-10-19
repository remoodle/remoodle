# ReMoodle

Enhancing Moodle experience with care

## Development

### Prerequisites

Make sure you have the following installed:

1. **Node.js (v20)** - Download it via [fnm](https://github.com/Schniz/fnm).

2. **pnpm (v9)** - Installation instructions on the [pnpm website](https://pnpm.io/installation).

3. **Redis** - Installation instructions can be found on the [Redis website](https://redis.io/download).

4. **MongoDB** - Installation guides are available on the [MongoDB official site](https://www.mongodb.com/docs/manual/installation/).

### 1. Creating a Telegram Bot

To create a Telegram bot, chat with @BotFather on Telegram, follow his instructions to set up your TESTING bot, and obtain the API token he provides for integrating with the Telegram API.

> [!TIP]
> Follow the ReMoodle::dev::[your-bot-username] guideline

### 2. Running the Setup Script

Before starting your development, run the setup script to configure environment variables:

```bash
node scripts/setup-env.cjs
```

Follow the prompts to enter the required variables such as the Telegram Bot Token and Telegram Bot Username.

### 3. Install dependencies

```bash
pnpm install
```

### 4. Run the application

> [!IMPORTANT]  
> Make sure ReMoodle Core is running. Follow the instructions in the [core repository](https://github.com/remoodle/core) to run it if it's not.

### Run the application

```bash
pnpm run dev
```

### Access it

- Frontend http://localhost:5173/
- Backend http://localhost:9000/health
- Backend (Core) http://localhost:9000/v1/health
- Telegram Bot Server http://localhost:8888/health
- Alert Worker http://localhost:8787/
