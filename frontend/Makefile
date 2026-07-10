LOG_DIR := ../.dev-logs
SCRIPTS := ../scripts

# Under real WSL, PATH pulls in the Windows Node install via /mnt/c/... interop, but WSL can't
# exec a .cmd file directly (no cmd.exe interpreter) - it falls back to reading it as a shell
# script and dies on the batch syntax ("Unterminated quoted string"). The extensionless "npm" file
# alongside npm.cmd is the POSIX shim actually meant for this case (see the comment on `start`
# below for why Git Bash needs the opposite choice), so pick the interpreter-appropriate one based
# on whether we're running inside WSL ($WSL_DISTRO_NAME is set by WSL itself for exactly this).
ifdef WSL_DISTRO_NAME
NPM := npm
# WSL2's default (NAT) networking mode can't reach a Windows-hosted loopback service via
# "localhost" from inside the WSL VM - only a real Windows process can, so the health-check below
# needs the actual Windows curl.exe (reachable transparently via WSL interop), not WSL's own curl.
CURL := curl.exe
# Same story as npm/npm.cmd above: WSL's exec doesn't append .exe on PATH lookup the way
# cmd.exe/PATHEXT does, so the bare "powershell" name (which Git Bash resolves fine) isn't found.
POWERSHELL := powershell.exe
else
NPM := npm.cmd
CURL := curl
POWERSHELL := powershell
endif

.DEFAULT_GOAL := help

.PHONY: help start stop restart install build lint logs clean

help: ## Show this help
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

# This recipe (backgrounding via "(... &)", and the "sh -c '...'" polling loop below) needs a
# real POSIX shell (sh.exe) reachable on PATH - see backend/Makefile for the full explanation of
# why that isn't automatic even with Git for Windows installed, and what breaks under cmd.exe if
# it's missing. Under Git Bash, it must call "npm.cmd" explicitly rather than bare "npm": Node's
# Windows install includes a plain extension-less "npm" file too, but that one's a POSIX shim
# meant for WSL/Cygwin - Git's bash finds it first on PATH and fails to exec it ("No such file or
# directory"), where cmd.exe would have silently resolved bare "npm" to npm.cmd itself via
# PATHEXT. Under real WSL the opposite is true (see the $(NPM) definition above) - hence picking
# the interpreter based on environment rather than hardcoding either name.
start: ## Start the Vite dev server in the background (:5173)
	@mkdir -p $(LOG_DIR);
	@sh -c ' \
		if $(CURL) -sf http://localhost:5173 >/dev/null 2>&1; then \
			echo "frontend already up: http://localhost:5173"; exit 0; \
		fi; \
		: > $(LOG_DIR)/frontend.log; \
		($(NPM) run dev >> $(LOG_DIR)/frontend.log 2>&1 &); \
		echo "waiting for frontend to start (streaming $(LOG_DIR)/frontend.log)..."; \
		tail -n +1 -f $(LOG_DIR)/frontend.log & \
		tailpid=$$!; \
		i=0; \
		until $(CURL) -sf http://localhost:5173 >/dev/null 2>&1; do \
			i=$$((i+1)); \
			if [ $$i -ge 60 ]; then \
				kill $$tailpid 2>/dev/null; \
				echo "frontend failed to start within 60s - see $(LOG_DIR)/frontend.log"; \
				exit 1; \
			fi; \
			sleep 1; \
		done; \
		kill $$tailpid 2>/dev/null; \
		echo "frontend up: http://localhost:5173" \
	'

stop: ## Stop the frontend dev server (and free :5173 if anything's still bound to it)
	@$(POWERSHELL) -NoProfile -ExecutionPolicy Bypass -File $(SCRIPTS)/stop-process.ps1 -ProcessName node.exe -CommandLineMatch vite -Port 5173

restart: stop start ## Restart the frontend

install: ## Install frontend dependencies
	npm install

build: ## Type-check and build the frontend for production
	npm run build

lint: ## Lint the frontend
	npm run lint

logs: ## Tail frontend logs
	tail -f $(LOG_DIR)/frontend.log

clean: ## Remove frontend build output
	rm -rf dist
