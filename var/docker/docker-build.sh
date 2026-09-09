#!/bin/bash

set -euo pipefail

docker build -t localhost/postiz -f Dockerfile.dev .
