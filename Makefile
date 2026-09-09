SHELL := /bin/bash
.DEFAULT_GOAL := help
# Keep setup steps ordered even when invoked with make -j.
.NOTPARALLEL:

COMPOSE := docker compose -f docker-compose.local.yaml
PRISMA := bun x prisma@6.5.0
SCHEMA := libraries/nestjs-libraries/src/database/prisma/schema.prisma
SERVICE ?=
CONFIRM ?=

.PHONY: help doctor env install setup dev dev-backend dev-frontend dev-api dev-worker dev-extension dev-legacy deps deps-stop deps-down deps-logs status health db-generate db-push db-studio db-reset build build-backend build-frontend build-orchestrator build-extension build-sdk build-commands build-legacy test clean

help: ## List commands (default)
	@printf 'Postiz local development\n\nFirst run: make setup && make dev\nStop dev: Ctrl-C; stop dependencies: make deps-stop\nUI: http://localhost:4200\n\n'
	@sed -n 's/^\([a-z-]*\):.*## \(.*\)/\1|\2/p' Makefile | while IFS='|' read -r target description; do printf '  %-22s %s\n' "$$target" "$$description"; done
	@printf '\nOptional: SERVICE=postgres|redis|temporal for dependency logs.\nAll Docker targets use the isolated postiz-extra-local stack.\n'

doctor: ## Check tools and report supported runtime versions
	@command -v bun >/dev/null && bun --version
	@command -v node >/dev/null && node --version
	@node -e 'const [major, minor] = process.versions.node.split(".").map(Number); if (major !== 22 || minor < 12) console.warn("WARNING: supported Node range is >=22.12.0 <23.0.0 (CI: 22.20.0).");'
	@test "$$(bun --version)" = '1.3.14' || printf 'WARNING: repository pins Bun 1.3.14.\n'
	@docker compose version
	@docker info --format 'Docker server: {{.ServerVersion}}'

env: ## Create private local .env if absent; never overwrite existing settings
	@bun scripts/setup-local-env.ts

install: env ## Install locked dependencies and generate Prisma client
	bun install --frozen-lockfile

setup: ## Prepare .env, dependencies, containers, and database schema
	$(MAKE) doctor
	$(MAKE) install
	$(MAKE) deps
	$(MAKE) db-push
	@printf '\nSetup complete. Run make dev, then open http://localhost:4200.\n'

dev: deps ## Run all app watchers in foreground; Ctrl-C stops apps
	bun run dev

dev-backend: deps ## Run backend and new UI together (no worker/extension)
	bun run dev-backend

dev-frontend: ## Run only the new UI on port 4200
	bun run dev:frontend

dev-api: deps ## Run only the backend on port 3000
	bun run dev:backend

dev-worker: deps ## Run only the Temporal orchestrator
	bun run dev:orchestrator

dev-extension: ## Build and watch the browser extension
	bun run dev:extension

dev-legacy: env ## Run legacy Next.js handlers/UI on port 4201
	bun run dev:frontend:legacy

deps: env ## Start isolated dependencies and wait until healthy
	$(COMPOSE) up -d --wait

deps-stop: ## Stop isolated dependencies; retain containers and data
	$(COMPOSE) stop

deps-down: ## Remove isolated dependency containers/networks; retain data volumes
	$(COMPOSE) down

deps-logs: ## Follow dependency logs; optionally pass SERVICE=temporal
	$(COMPOSE) logs --tail=100 -f $(SERVICE)

status: ## Show isolated dependency health and published ports
	$(COMPOSE) ps -a

health: ## Check dependencies, UI, and the unauthenticated backend proxy
	$(COMPOSE) exec -T postgres pg_isready -U postiz-local -d postiz-db-local
	$(COMPOSE) exec -T redis redis-cli ping
	$(COMPOSE) exec -T temporal temporal operator cluster health --address 127.0.0.1:7233
	@code=$$(curl --max-time 10 -sS -o /dev/null -w '%{http_code}' http://localhost:4200/) && test "$$code" = 200 || { printf 'UI check failed (expected HTTP 200). Start make dev.\n'; exit 1; }
	@code=$$(curl --max-time 10 -sS -o /dev/null -w '%{http_code}' http://localhost:4200/api/user/self) && test "$$code" = 401 || { printf 'Backend proxy check failed (expected unauthenticated HTTP 401).\n'; exit 1; }
	@printf 'Healthy: UI HTTP 200; backend proxy HTTP 401 (expected before login).\n'

db-generate: ## Regenerate Prisma client without changing the database
	bun run prisma-generate

db-push: env ## Apply schema to DATABASE_URL; refuse changes requiring data loss
	$(PRISMA) db push --schema $(SCHEMA)

db-studio: env ## Open Prisma Studio for DATABASE_URL
	$(PRISMA) studio --schema $(SCHEMA)

db-reset: ## DESTRUCTIVE: reset DATABASE_URL database; requires CONFIRM=reset-database
	@test "$(CONFIRM)" = 'reset-database' || { printf 'Deletes ALL data in the database selected by .env DATABASE_URL.\nStop app watchers, check .env, then use make db-reset CONFIRM=reset-database.\n'; exit 1; }
	$(PRISMA) db push --force-reset --schema $(SCHEMA)

build: ## Build every application
	bun run build

build-backend: ## Build the backend
build-frontend: ## Build the new UI
build-orchestrator: ## Build the Temporal worker
build-extension: ## Build the browser extension
build-sdk: ## Build the SDK
build-commands: ## Build the command-line app

build-backend build-frontend build-orchestrator build-extension build-sdk build-commands:
	bun run build:$(patsubst build-%,%,$@)

build-legacy: ## Build the legacy Next.js frontend
	bun run build:frontend:legacy

test: ## Run the existing Vitest suite
	bun run test

clean: ## Remove generated builds/caches only; stop app watchers first
	rm -rf apps/backend/dist apps/orchestrator/dist apps/frontend/dist apps/extension/dist apps/commands/dist apps/sdk/dist apps/frontend/.next
	rm -f apps/backend/.tsbuildinfo apps/orchestrator/.tsbuildinfo apps/commands/.tsbuildinfo
