#!/usr/bin/env bash
# One-time, idempotent hardening and Docker install for a fresh Ubuntu LTS VPS.
#
# Run as root ON the server:
#   DEPLOY_USER=deploy DEPLOY_PUBLIC_KEY="ssh-ed25519 AAAA... comment" bash setup-vps.sh
#
# Safety: SSH password and root login are only disabled after the deploy user's
# key is installed. Keep your current SSH session open and test a second login
# as the deploy user before closing it.
set -euo pipefail

: "${DEPLOY_USER:?Set DEPLOY_USER (the non-root user that will run deployments)}"
: "${DEPLOY_PUBLIC_KEY:?Set DEPLOY_PUBLIC_KEY (the public key allowed to log in as DEPLOY_USER)}"
SSH_PORT="${SSH_PORT:-22}"
HTTP_PORT="${HTTP_PORT:-80}"
HTTPS_PORT="${HTTPS_PORT:-443}"
APP_DIR="${APP_DIR:-/opt/hearthkey}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root." >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

echo "==> Updating packages"
apt-get update -y
apt-get upgrade -y
apt-get install -y ca-certificates curl gnupg ufw fail2ban unattended-upgrades

echo "==> Automatic security updates"
dpkg-reconfigure -f noninteractive unattended-upgrades

echo "==> Deploy user"
if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
fi
install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
AUTH_KEYS="/home/$DEPLOY_USER/.ssh/authorized_keys"
touch "$AUTH_KEYS"
grep -qxF "$DEPLOY_PUBLIC_KEY" "$AUTH_KEYS" || echo "$DEPLOY_PUBLIC_KEY" >> "$AUTH_KEYS"
chown "$DEPLOY_USER:$DEPLOY_USER" "$AUTH_KEYS"
chmod 600 "$AUTH_KEYS"

echo "==> Docker Engine and Compose plugin"
if ! command -v docker >/dev/null 2>&1; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi
usermod -aG docker "$DEPLOY_USER"

echo "==> Application directory"
install -d -m 750 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$APP_DIR"

echo "==> SSH hardening (key-only, no root login)"
cat > /etc/ssh/sshd_config.d/99-hearthkey.conf <<SSHD
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
AllowUsers $DEPLOY_USER
SSHD
sshd -t
systemctl reload ssh || systemctl reload sshd

echo "==> Firewall (only SSH, HTTP, HTTPS)"
ufw default deny incoming
ufw default allow outgoing
ufw allow "$SSH_PORT/tcp"
ufw allow "$HTTP_PORT/tcp"
ufw allow "$HTTPS_PORT/tcp"
ufw --force enable

echo "==> fail2ban"
systemctl enable --now fail2ban

echo "Done. In a NEW terminal, confirm: ssh $DEPLOY_USER@<server>  (before closing this session)."
echo "Note: Docker-published ports bypass ufw; only Caddy publishes ports (80/443) in the production compose file."
