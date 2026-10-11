# Environments runbook

Decisions: [ADR-0001](../adr/0001-hosting-fly-staging-vps-production.md) (staging on Fly.io, production on a VPS) and [ADR-0002](../adr/0002-domain-sgummalla-net.md) (domain). Never put real secrets in the repo or in chat.

## Local

```sh
cp deploy/local/local.env.example deploy/local/local.env
docker compose --env-file deploy/local/local.env -f deploy/local/docker-compose.yml up --build
curl localhost:3000/v1/health
```

## Production VPS (Docker Compose)

1. Create a dedicated SSH key on your computer: `ssh-keygen -t ed25519 -C hearthkey-deploy`.
2. Copy `deploy/production/setup-vps.sh` to the server and run it as root, keeping your first SSH session open:
   `DEPLOY_USER=deploy DEPLOY_PUBLIC_KEY="<contents of the .pub file>" bash setup-vps.sh`
3. In a new terminal confirm `ssh deploy@<server-ip>` works, then close the old session.
4. As `deploy`, copy `docker-compose.yml` and `Caddyfile` to `/opt/hearthkey/`, and create `/opt/hearthkey/.env` (mode 600) from `production.env.example` with real values.
5. DNS at GoDaddy: add an `A` record `api` pointing at the server IP (and `AAAA` if it has IPv6), plus a `CAA` record limiting issuance to Let's Encrypt.
6. Start: `docker compose pull && docker compose up -d`. Caddy obtains the certificate automatically.
7. Verify: `curl https://api.sgummalla.net/v1/health`.

Roll back by setting `HEARTHKEY_API_IMAGE` to the previous tag and running `docker compose up -d`.

## Staging (Fly.io)

1. Install and log in: `fly auth login`.
2. Create the app once: `fly apps create hearthkey-staging`.
3. Deploy from the repo root: `fly deploy --config deploy/fly/staging.fly.toml --dockerfile apps/api/Dockerfile`.
4. Set secrets (never in the file): `fly secrets set HEARTHKEY_DATABASE_URL=... --app hearthkey-staging`.
5. Custom domain: `fly certs add staging-api.sgummalla.net --app hearthkey-staging`, then add the DNS records Fly prints at GoDaddy.

## Notes
- MinIO no longer publishes community Docker images, so blob storage is deferred to Sprint 14; the filesystem `BlobStore` adapter covers local use until a replacement is chosen.
- Database for staging (Fly Postgres or another managed Postgres) is chosen when the first migration lands.
