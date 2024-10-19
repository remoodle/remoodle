
# Usage

- Copy `.env.example` to `.env` and place your password for grafana.
- Copy `/prometheus/prometheus.yml.example` to `prometheus/prometheus.yml` and set your target.
- Start docker compose:
```sh
docker compose up -d
```
Prometheus will be available under 127.0.0.1:9090 and grafana under 127.0.0.1:3000.

# Dashboards
The `dashboards` directory contains two grafana dashboards for roadrunner in json format. You can use them,
