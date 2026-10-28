# Docker Model Runner Demo

## Description

This is a demo of Docker Model Runner (DMR) as shown in the [10/02/2026 Tech Reform Collective Lunch & Learn session](https://www.youtube.com/watch?v=gJmiZwGCZA0).

## Usage

- `build.sh` - Build the Docker image for the demo.
- `start.sh` - Start the Docker Model Runner demo application
- `run.sh` - Run a container that opens an interactive Qwen Code session with the local model
- `stop.sh` - Stop the running application

## Sandboxing

The model, MCP server, and chat interface are all sandboxed within their own Docker containers. The `sandbox/` directory is visible to the Qwen Code container as a mounted volume, allowing you to provide the model with files access any files that get generated in the session. The model is not able to access any files outside of the sandbox directory.