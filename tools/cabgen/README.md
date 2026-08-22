# cabgen

Takes screenshots of every cabinet on [aitumap.remoodle.app](https://aitumap.remoodle.app) and saves them to `screenshots/`.

## Setup

```sh
pnpm install
pnpm run install-browsers
```

## Run

```sh
pnpm start
```

Screenshots land in `screenshots/<cabinet>.png`. Each cabinet is a separate test — failed ones can be retried individually.

```sh
pnpm start --last-failed   # retry only failures
pnpm run report            # open HTML report
pnpm run start:headed      # show browser windows
pnpm run start:debug       # step-through debugger
```

## Config

Edit the top of `src/screenshots.spec.js`:

| Key                 | Default | Description                                   |
| ------------------- | ------- | --------------------------------------------- |
| `WAIT_AFTER_SEARCH` | `3000`  | ms to wait after search before screenshotting |

To change parallelism, edit `workers` in `playwright.config.js` (default: `4`).

## Updating `cabinets.json`

Edit `cabinets.json` manually or re-fetch from the ReMoodle API.
