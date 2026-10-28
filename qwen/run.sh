#!/bin/bash
qwen --openai-base-url http://docker-model-runner:12434/engines/v1 \
     --model "$MAIN_LLM_NAME" \
     --openai-api-key none \
     --auth-type openai