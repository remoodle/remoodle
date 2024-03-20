#!/bin/sh

# Step 1: Generate .env file
{
  echo "CRYPT_KEY=\"${CRYPT_KEY}\""
  echo "DATABASE_NAME=\"${DATABASE_NAME}\""
  echo "DATABASE_USERNAME=\"${DATABASE_USERNAME}\""
  echo "DATABASE_PASSWORD=\"${DATABASE_PASSWORD}\""
  echo "DATABASE_DRIVER=\"${DATABASE_DRIVER}\""
  echo "DATABASE_HOST=\"${DATABASE_HOST}\""
  echo "PASSWORD_SALT=\"${PASSWORD_SALT}\""
  echo "RESEND_API_KEY=\"${RESEND_API_KEY}\""
  echo "MOODLE_WEBSERVICE_URL=\"${MOODLE_WEBSERVICE_URL}\""
} > /app/.env

# Step 2: Run database migrations
./vendor/bin/phinx migrate

# Step 3: Start RoadRunner server
./rr serve -c .rr.yaml
