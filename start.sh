#!/bin/bash
docker model restart-runner
docker compose up -d mcp-web-tools
docker network connect qwen-sandbox_qwen-bridge docker-model-runner --alias docker-model-runner
