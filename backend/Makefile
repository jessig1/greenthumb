LOG_DIR := ../.dev-logs
SCRIPTS := ../scripts

# WSL2's default (NAT) networking mode can't reach a Windows-hosted loopback service via
# "localhost" from inside the WSL VM - only a real Windows process can, so the health-check below
# needs the actual Windows curl.exe (reachable transparently via WSL interop) when make itself is
# running inside WSL, not WSL's own curl. See frontend/Makefile for the fuller WSL-interop story.
ifdef WSL_DISTRO_NAME
CURL := curl.exe
# Same story as npm/npm.cmd in frontend/Makefile: WSL's exec doesn't append .exe on PATH lookup
# the way cmd.exe/PATHEXT does, so the bare "powershell" name (which Git Bash resolves fine) isn't
# found there - it needs the explicit .exe name instead.
POWERSHELL := powershell.exe
else
CURL := curl
POWERSHELL := powershell
endif

.DEFAULT_GOAL := help

.PHONY: help start stop restart test build logs clean

help: ## Show this help
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

start: ## Start the Spring Boot backend in the background (:8080)
	@mkdir -p $(LOG_DIR);
	@sh -c ' \
		if $(CURL) -sf http://localhost:8080/v3/api-docs >/dev/null 2>&1; then \
			echo "backend already up: http://localhost:8080"; exit 0; \
		fi; \
		: > $(LOG_DIR)/backend.log; \
		(./mvnw -q spring-boot:run >> $(LOG_DIR)/backend.log 2>&1 &); \
		echo "waiting for backend to start (streaming $(LOG_DIR)/backend.log - a cold build can take a couple minutes)..."; \
		tail -n +1 -f $(LOG_DIR)/backend.log & \
		tailpid=$$!; \
		i=0; \
		until $(CURL) -sf http://localhost:8080/v3/api-docs >/dev/null 2>&1; do \
			i=$$((i+1)); \
			if [ $$i -ge 180 ]; then \
				kill $$tailpid 2>/dev/null; \
				echo "backend failed to start within 180s - see $(LOG_DIR)/backend.log"; \
				exit 1; \
			fi; \
			sleep 1; \
		done; \
		kill $$tailpid 2>/dev/null; \
		echo "backend up: http://localhost:8080" \
	'

stop: ## Stop the backend (and free :8080 if anything's still bound to it)
	@$(POWERSHELL) -NoProfile -ExecutionPolicy Bypass -File $(SCRIPTS)/stop-process.ps1 -ProcessName java.exe -CommandLineMatch backend -Port 8080

restart: stop start ## Restart the backend

# This entire Makefile assumes a real POSIX shell (sh.exe) is reachable on PATH - `start`'s
# "(... &)" backgrounding, its "sh -c '...'" polling loop, and every "./mvnw" all require one.
# This Make build (ezwinports) only uses one when it can find it; otherwise every recipe line
# runs through cmd.exe instead, which can't parse any of the above ("The syntax of the command is
# incorrect." / ") was unexpected at this time."). Git for Windows ships sh.exe, but installing
# it does NOT put it on PATH by default - only its cmd/ dir (git.exe itself) goes on PATH; you
# need Git's usr/bin (e.g. "C:\Program Files\Git\usr\bin") on PATH too. If recipes below are
# failing with cmd.exe-flavored syntax errors, that's the first thing to check.
#
# The trailing ';' on the ./mvnw lines further down is deliberate, not a typo: even with sh.exe
# reachable, this Make build's "skip the shell for simple recipe lines" optimization still routes
# a line with zero shell metacharacters through cmd.exe, which breaks "./" relative-path syntax.
# The ';' is a no-op that forces proper shell invocation. Lines that already use a
# redirect/pipe/&&/parens don't need it.
#
# `start`'s startup-wait loop deliberately avoids the external "timeout" command (implementing
# the 180s bound as a plain counter inside the sh -c loop instead): Windows ships its own
# System32\timeout.exe - a completely different, incompatible program (just "pause N seconds",
# can't run a command) - and it sits earlier on PATH than Git's coreutils timeout.exe even once
# usr/bin is added, so plain "timeout 180 ..." resolves to the wrong one and fails confusingly.
#
# The 180s bound (and streaming backend.log to the console while waiting) is deliberately
# generous/visible: `spring-boot:run` recompiles from source and boots a full Spring context every
# time (19s+ for context init alone, on top of whatever Maven's compile step takes), which can
# comfortably blow past a tight timeout on a cold build - especially if this is ever invoked from
# inside WSL against a project directory that lives on the Windows filesystem (/mnt/c/...), where
# every file read during compilation crosses the slow 9p/virtiofs boundary. Without the streamed
# log, a slow-but-successful start and a hard crash both look identical from the outside (silent
# wait, then a generic failure message) - streaming makes the real state visible immediately
# instead of only after the timeout gives up. The `already up` short-circuit at the top makes
# `start` idempotent, so re-running `make up` after a slow start doesn't race a second mvnw
# instance against the first one's port bind.

test: ## Run backend tests (needs Docker Desktop running, for Testcontainers)
	./mvnw test;

build: ## Build the backend jar
	./mvnw -q clean package;

logs: ## Tail backend logs
	tail -f $(LOG_DIR)/backend.log

clean: ## Remove backend build artifacts
	./mvnw -q clean;
