# Deploy this branch as a Render Docker Web Service (Free, Frankfurt).
# Pin the upstream image: redeploys must not silently upgrade n8n.
FROM docker.n8n.io/n8nio/n8n:2.37.10

# Non-secret defaults. Missing PostgreSQL credentials must fail instead of
# falling back to local SQLite on Render's ephemeral filesystem.
ENV DB_TYPE=postgresdb \
    DB_POSTGRESDB_PORT=5432 \
    DB_POSTGRESDB_DATABASE=postgres \
    DB_POSTGRESDB_SCHEMA=n8n \
    DB_POSTGRESDB_SSL_ENABLED=true \
    N8N_PORT=10000 \
    N8N_LISTEN_ADDRESS=0.0.0.0 \
    N8N_PROTOCOL=https \
    N8N_PROXY_HOPS=1 \
    GENERIC_TIMEZONE=Africa/Cairo \
    TZ=Africa/Cairo

# Supply host, pooler user/password, fixed encryption key, and public URLs
# in Render Environment. Never add their values to this repository.
EXPOSE 10000
CMD ["start"]
