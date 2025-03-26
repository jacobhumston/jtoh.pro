#!/bin/bash

# Wrapper for bunx

script_dir="$(cd "$(dirname "$0")" && pwd)"
if [ "$PWD" != "$script_dir" ]; then
    echo "This script must be run from its directory: $script_dir"
    exit 1
fi

dir_modules="./node_modules/.bin/"
dir_bun="${dir_modules}bun"

declare -A commands
    commands["format"]="${dir_modules}prettier ./ --write --cache"
    commands["start"]="${dir_bun} run src/index.ts --dev"
    commands["start-prod"]="${dir_modules}pm2 start \"${dir_bun} run src/index.ts\" --name jtoh.pro"
    commands["start-beta"]="${dir_modules}pm2 start \"${dir_bun} run src/index.ts --beta\" --name jtoh.pro-beta"
    commands["tools-group-members"]="${dir_bun} run tools/group-members.ts"
    commands["tools-populate"]="${dir_bun} run tools/populate.ts"
    commands["cli"]="${dir_bun} run src/cli/index.ts"
    commands["version"]="${dir_bun} -v"

print_help() {
    echo "Usage: $0 <command>"
    echo "Available commands:"
    for key in "${!commands[@]}"; do
        echo -n " $key"
    done
    echo ""
}

command_to_run="$1"

if [ -z "$command_to_run" ]; then
    echo "No command specified."
    print_help
    exit 1
fi

if [ -z "${commands[$command_to_run]}" ]; then
    echo "Command not found: $command_to_run"
    print_help
    exit 1
fi

echo "Running command: $command_to_run"
echo "> ${commands[${command_to_run}]}"

${commands[${command_to_run}]}