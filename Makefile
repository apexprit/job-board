.PHONY: help dev build test docker-up docker-down docker-build lint

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Start development servers
	@echo "Starting development environment..."
	@cd server && npm run dev &
	@cd client && npm run dev

build: ## Build all packages
	@cd shared && npm run build
	@cd server && npm run build
	@cd client && npm run build

test: ## Run all tests
	@cd server && npm test
	@cd client && npm run test -- --run

lint: ## Lint all packages
	@cd server && npx eslint src/
	@cd client && npx eslint src/

docker-build: ## Build Docker images
	docker compose build

docker-up: ## Start Docker Compose
	docker compose up -d

docker-down: ## Stop Docker Compose
	docker compose down

docker-dev: ## Start development Docker services (postgres + redis only)
	docker compose -f docker-compose.dev.yml up -d

docker-seed: ## Seed the database
	@cd server && npm run db:seed

migrate: ## Run database migrations
	@cd server && npm run db:migrate

setup: ## Initial project setup
	npm ci
	@cd shared && npm run build
	@cd server && npx prisma generate && npx prisma db push
	@cd server && npm run db:seed
