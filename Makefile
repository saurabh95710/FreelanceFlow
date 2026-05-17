.PHONY: help dev prod stop logs seed test clean

help:
	@echo ""
	@echo "  FreelanceFlow — Available Commands"
	@echo "  ─────────────────────────────────"
	@echo "  make dev       Start in development mode (Docker DB + local servers)"
	@echo "  make prod      Build and start full production stack via Docker"
	@echo "  make stop      Stop all containers"
	@echo "  make logs      Tail logs from all containers"
	@echo "  make seed      Seed the database with demo data"
	@echo "  make test      Run backend tests"
	@echo "  make clean     Remove containers and volumes (DESTROYS DATA)"
	@echo ""

dev:
	@echo "🚀 Starting development environment..."
	docker compose -f docker-compose.dev.yml up -d postgres
	@echo "⏳ Waiting for postgres..."
	@sleep 3
	@echo "🔧 Running migrations..."
	cd backend && npx prisma migrate dev
	@echo "✅ Start backend: cd backend && npm run dev"
	@echo "✅ Start frontend: cd frontend && npm run dev"

prod:
	@echo "🏗️  Building production stack..."
	cp .env.example .env
	@echo "⚠️  Edit .env with your secrets before continuing!"
	@read -p "Press Enter after editing .env..."
	docker compose up --build -d
	@echo "✅ App running at http://localhost"

stop:
	docker compose down
	docker compose -f docker-compose.dev.yml down

logs:
	docker compose logs -f --tail=50

seed:
	cd backend && npx ts-node prisma/seed.ts

test:
	cd backend && npm test

clean:
	docker compose down -v --remove-orphans
	docker compose -f docker-compose.dev.yml down -v --remove-orphans
	@echo "🗑️  All containers and volumes removed"