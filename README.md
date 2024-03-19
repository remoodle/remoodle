# remoodle-services

ReMoodle API Service

## Getting Started

### Copy template env files and configure them

```bash
cp .env.example .env
```

```bash
cp .rr.yaml.example .rr.yaml
```

### Run (with Docker)

```bash
docker compose up -d
```

### Run (manually)

```bash
php righthand.php key:generate
./vendor/bin/phinx migrate
./rr serve
```
