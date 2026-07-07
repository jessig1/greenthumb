# WSL2's default (NAT) networking mode can't reach a Windows-hosted loopback service via
# "localhost" from inside the WSL VM - only a real Windows process can, so `status` needs the
# actual Windows curl.exe (reachable transparently via WSL interop) when make itself is running
# inside WSL, not WSL's own curl. See frontend/Makefile for the fuller WSL-interop story.
ifdef WSL_DISTRO_NAME
CURL := curl.exe
else
CURL := curl
endif

.DEFAULT_GOAL := help

.PHONY: help up down restart status \
        db-up db-down db-reset db-logs \
        backend-start backend-stop backend-restart backend-test backend-build backend-logs \
        frontend-start frontend-stop frontend-restart frontend-install frontend-build frontend-lint frontend-logs \
        install test build clean

help: ## Show available tasks (backend/Makefile and frontend/Makefile have more granular targets)
	@echo "GreenThumb dev tasks:"
	@echo ""
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

## --- Whole stack ---

up: db-up backend-start frontend-start ## Start Postgres, backend, and frontend together
	@echo ""
	@echo "Frontend: http://localhost:5173"
	@echo "Backend:  http://localhost:8080"

down: frontend-stop backend-stop db-down ## Stop everything

restart: down up ## Restart everything

status: ## Show what's currently running
	@echo "--- Postgres ---"
	@docker compose ps
	@echo "--- Backend (:8080) ---"
	@$(CURL) -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:8080/v3/api-docs || echo "not running"
	@echo "--- Frontend (:5173) ---"
	@$(CURL) -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:5173 || echo "not running"

## --- Database ---

db-up: ## Start local Postgres
	docker compose up -d

db-down: ## Stop local Postgres
	docker compose down

db-reset: ## Stop Postgres and wipe its data volume
	docker compose down -v
	docker compose up -d

db-logs: ## Tail Postgres logs
	docker compose logs -f postgres

## --- Backend (see backend/Makefile) ---

backend-start: ## Start the backend
	$(MAKE) -C backend start

backend-stop: ## Stop the backend
	$(MAKE) -C backend stop

backend-restart: ## Restart the backend
	$(MAKE) -C backend restart

backend-test: ## Run backend tests
	$(MAKE) -C backend test

backend-build: ## Build the backend jar
	$(MAKE) -C backend build

backend-logs: ## Tail backend logs
	$(MAKE) -C backend logs

## --- Frontend (see frontend/Makefile) ---

frontend-start: ## Start the frontend
	$(MAKE) -C frontend start

frontend-stop: ## Stop the frontend
	$(MAKE) -C frontend stop

frontend-restart: ## Restart the frontend
	$(MAKE) -C frontend restart

frontend-install: ## Install frontend dependencies
	$(MAKE) -C frontend install

frontend-build: ## Build the frontend for production
	$(MAKE) -C frontend build

frontend-lint: ## Lint the frontend
	$(MAKE) -C frontend lint

frontend-logs: ## Tail frontend logs
	$(MAKE) -C frontend logs

## --- Combined dev tasks ---

install: frontend-install ## Install all dependencies

test: backend-test ## Run all tests

build: backend-build frontend-build ## Build everything for production

clean: ## Remove build artifacts and dev logs
	$(MAKE) -C backend clean
	$(MAKE) -C frontend clean
	rm -rf .dev-logs
