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
	@(./mvnw -q spring-boot:run > $(LOG_DIR)/backend.log 2>&1 &)
	@echo "waiting for backend to start..."
	@sh -c 'i=0; until $(CURL) -sf http://localhost:8080/v3/api-docs >/dev/null 2>&1; do i=$$((i+1)); [ $$i -ge 60 ] && exit 1; sleep 1; done' \
		&& echo "backend up: http://localhost:8080" \
		|| (echo "backend failed to start - check $(LOG_DIR)/backend.log" && exit 1)

stop: ## Stop the backend
	@$(POWERSHELL) -NoProfile -ExecutionPolicy Bypass -File $(SCRIPTS)/stop-process.ps1 -ProcessName java.exe -CommandLineMatch backend

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
# the 60s bound as a plain counter inside the sh -c loop instead): Windows ships its own
# System32\timeout.exe - a completely different, incompatible program (just "pause N seconds",
# can't run a command) - and it sits earlier on PATH than Git's coreutils timeout.exe even once
# usr/bin is added, so plain "timeout 60 ..." resolves to the wrong one and fails confusingly.

test: ## Run backend tests (needs Docker Desktop running, for Testcontainers)
	./mvnw test;

build: ## Build the backend jar
	./mvnw -q clean package;

logs: ## Tail backend logs
	tail -f $(LOG_DIR)/backend.log

clean: ## Remove backend build artifacts
	./mvnw -q clean;
