#!/bin/bash
docker network disconnect qwen-sandbox_qwen-bridge docker-model-runner 2>/dev/null || true
docker compose down --remove-orphans
