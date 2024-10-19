# @remoodle/core

ReMoodle Core API / Crawler service

## Getting Started

### Copy template env files and configure them

```bash
cp .env.example .env
```

### Run (with Docker)

```bash
docker compose up -d
```

### Run (manually)

```bash
php righthand.php key:generate
./vendor/bin/phinx migrate
./vendor/bin/rr get-binary
./rr serve
```
