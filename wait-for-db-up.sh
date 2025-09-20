#!/bin/sh
# wait-for-db-up.sh     this will wiat for the DB to come up
set -e

host="$1"
shift
cmd="$@"

until nc -z "$host" 5432; do
  echo "⏳ Waiting for Postgres at $host:5432..."
  sleep 2
done

>&2 echo "✅ Postgres is up - executing command"
exec $cmd