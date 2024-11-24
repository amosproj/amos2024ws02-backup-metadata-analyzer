#!/bin/bash
set -e

echo "Warte, bis PostgreSQL startet..."
until pg_isready -U postgres
do
  echo "PostgreSQL ist noch nicht bereit..."
  sleep 2
done

echo "Restauriere die Datenbank aus dumpfile.dmp..."
pg_restore -U postgres -d postgres /docker-entrypoint-initdb.d/db_dump.dmp

echo "Datenbank wurde erfolgreich restauriert!"