cd ~/Desktop/history.com   # 실제 경로
cat > deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "▶ 새 이미지 pull"
docker compose pull

echo "▶ 컨테이너 재시작"
docker compose up -d --remove-orphans

echo "▶ 이전 이미지 정리"
docker image prune -f

docker compose ps
EOF

chmod +x deploy.sh