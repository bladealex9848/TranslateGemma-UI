#!/bin/bash
# TranslateGemma-UI Deployment Script
# Run this on your VPS to deploy the application

set -e

echo "🚀 TranslateGemma-UI Deployment Script"
echo "======================================"

# Configuration
REPO_URL="https://github.com/bladealex9848/TranslateGemma-UI.git"
DEPLOY_DIR="/opt/translategemma-ui"
DOMAIN="translate.alexanderoviedofadul.dev"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}1. Checking prerequisites...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# Check Docker Compose
if ! command -v docker compose &> /dev/null; then
    echo "Docker Compose plugin not found, installing..."
    apt-get update && apt-get install -y docker-compose-plugin
fi

echo -e "${GREEN}✓ Docker ready${NC}"

echo -e "${YELLOW}2. Cloning/updating repository...${NC}"

if [ -d "$DEPLOY_DIR" ]; then
    cd "$DEPLOY_DIR"
    git pull origin main
else
    git clone "$REPO_URL" "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
fi

echo -e "${GREEN}✓ Repository ready${NC}"

echo -e "${YELLOW}3. Configuring environment...${NC}"

# Create production .env.local for frontend
cat > frontend/.env.local << EOF
# Production Environment
NEXT_PUBLIC_OLLAMA_HOST=http://ollama:11434
NEXT_PUBLIC_POCKETBASE_URL=http://pocketbase:8090
EOF

echo -e "${GREEN}✓ Environment configured${NC}"

echo -e "${YELLOW}4. Building and starting services...${NC}"

docker compose down --remove-orphans 2>/dev/null || true
docker compose build --no-cache
docker compose up -d

echo -e "${YELLOW}5. Waiting for services to start...${NC}"
sleep 10

echo -e "${YELLOW}6. Pulling TranslateGemma model...${NC}"
docker compose exec -T ollama ollama pull translategemma:latest || echo "Model will be pulled on first use"

echo -e "${YELLOW}7. Creating PocketBase admin...${NC}"
# Wait for PocketBase to be ready
sleep 5

echo ""
echo -e "${GREEN}======================================"
echo "✅ Deployment Complete!"
echo "======================================"
echo ""
echo "Services running:"
echo "  - Frontend: http://localhost:3000"
echo "  - PocketBase: http://localhost:8090"
echo "  - Ollama: http://localhost:11434"
echo ""
echo "Next steps:"
echo "  1. Configure reverse proxy (Caddy/Nginx) for HTTPS"
echo "  2. Create PocketBase admin at http://localhost:8090/_/"
echo "  3. Create 'translations' collection via API"
echo ""
echo "Domain: https://${DOMAIN}"
echo "======================================${NC}"
