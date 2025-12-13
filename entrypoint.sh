
#!/bin/sh
set -e

echo "Waiting for Postgres at ${DATABASE_URL:-(unset)} ..."

# Loop until DB is reachable
until python - <<'PY'
import os, sys
try:
    import psycopg2
except Exception:
    sys.exit(1)
dsn = os.environ.get("DATABASE_URL")
try:
    psycopg2.connect(dsn)
except Exception:
    sys.exit(1)
sys.exit(0)
PY
do
  sleep 1
done

echo "Postgres is up - running init_db.py (if present)..."
python init_db.py || true

echo "Starting Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000