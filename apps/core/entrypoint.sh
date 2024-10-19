#!/bin/sh

# Step 1: Generate .env file for phinx
{
  echo "DATABASE_NAME=\"${DATABASE_NAME}\""
  echo "DATABASE_USERNAME=\"${DATABASE_USERNAME}\""
  echo "DATABASE_PASSWORD=\"${DATABASE_PASSWORD}\""
  echo "DATABASE_DRIVER=\"${DATABASE_DRIVER}\""
  echo "DATABASE_HOST=\"${DATABASE_HOST}\""
} > /app/.env

# Step 2: Run database migrations
./vendor/bin/phinx migrate

# Step 3: Start RoadRunner server
./rr serve -c .rr.yaml
