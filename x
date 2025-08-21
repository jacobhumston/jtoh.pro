#!/bin/bash

#### Wrapper for bunx
#####################

# Define colors.
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NO_COLOR='\033[0m'

# Handle the script being used in the wrong directory.
script_dir="$(cd "$(dirname "$0")" && pwd)"
if [ "$PWD" != "$script_dir" ]; then
    echo -e "${RED}This script must be run from it's own directory.${NO_COLOR} ($script_dir)"
    exit 1
fi

# Check if the script is running as root (sudo).
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}This script must be run as root or with sudo.${NO_COLOR}"
    echo -e "${YELLOW}Attempting to execute as sudo...${NO_COLOR}"
    sudo "$0" "$@"
    exit 1
fi

# Define modules.
dir_modules="./node_modules/.bin/"
dir_bun="${dir_modules}bun"
dir_bunx="${dir_modules}bunx"

function install_cloudflared() {
    # Add cloudflare gpg key
    sudo mkdir -p --mode=0755 /usr/share/keyrings
    curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null

    # Add this repo to your apt repositories
    echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main' | sudo tee /etc/apt/sources.list.d/cloudflared.list

    # install cloudflared
    sudo apt-get update && sudo apt-get install cloudflared
}

# Define commands.
declare -A commands

    # Commands executed by bun directly.
    commands["start"]="${dir_bun} run src/index.ts --dev"
    commands["start-inspector"]="${dir_bun} run --inspect src/index.ts --dev"
    commands["tools-group-members"]="${dir_bun} run tools/group-members.ts"
    commands["tools-populate"]="${dir_bun} run tools/populate.ts"
    commands["cli"]="${dir_bun} run src/cli/index.ts"
    commands["version"]="${dir_bun} -v"

    # Commands executed by bunx.
    commands["format"]="${dir_bunx} prettier ./ --write --cache"
    commands["start-prod"]="${dir_bunx} pm2 start \"${dir_bun} run src/index.ts\" --name jtoh.pro"
    commands["start-beta"]="${dir_bunx} pm2 start \"${dir_bun} run src/index.ts --beta\" --name jtoh.pro-beta"
    commands["format-loop"]="${commands["format"]} && echo -e \"${YELLOW}Format loop enabled, press ENTER to format again. ${NO_COLOR}To exit, use ${GREEN}CTRL+C${NO_COLOR}\" && read && ./x format-loop"

    # Bun Commands
    commands["bun-upgrade"]="${dir_bun} upgrade"
    commands["bun-update"]="${dir_bun} update --latest && ${dir_bun} install"

    # Other commands.
    commands["devtunnel"]="devtunnel host -p 80 --allow-anonymous"
    commands["cloc"]="cloc --exclude-list-file=.gitignore ."
    commands["bun"]="${dir_bun}"
    commands["tunnel"]="cloudflared tunnel run --token eyJhIjoiOWYwNjAwZjNmZmI3MDNhYWYxN2U5MmRkYjNkMzJlMzEiLCJ0IjoiNmM2NWEzMWUtYmU3Ny00YjkzLThjNGEtODNjNmYzNjcxZDJhIiwicyI6IlpHVTNPV05sTVRZdFpHUTFaaTAwWlRFMUxXSTRNRGN0WVRobU1qVXhaR05qWVRKaiJ9"
    commands["install-cloudflared"]="install_cloudflared"

    # Aliases.
    commands["f"]=${commands["format"]}
    commands["s"]=${commands["start"]}
    commands["v"]=${commands["version"]}   
    commands["c"]="${commands["bun-upgrade"]} && ${commands["bun-update"]} && ${commands["format"]}" 
    commands["nd"]="${commands["start"]} --url https://dev.jtoh.pro --skipQWT"

# Help function.
print_help() {
    echo -e "${GREEN}Usage:${NO_COLOR} $0 <command>"
    echo -e "${GREEN}Available commands:${NO_COLOR}"
    for key in "${!commands[@]}"; do
        echo -n " $key"
    done
    echo ""
}

# The command to run.
command_to_run="$1"
shift

# Handle no command specified.
if [ -z "$command_to_run" ]; then
    echo -e "${RED}No command specified.${NO_COLOR}"
    print_help
    exit 1
fi

# Handle unknown command.
if [ -z "${commands[$command_to_run]}" ]; then
    echo -e "${RED}Command not found: ${YELLOW}$command_to_run${NO_COLOR}"
    print_help
    exit 1
fi

# Print the command that is being ran.
echo -e "${GREEN}Running command:${NO_COLOR} $command_to_run"
echo -e "${GREEN}>${YELLOW} ${commands[${command_to_run}]} $@${NO_COLOR}"

# Run the command.
eval "${commands[${command_to_run}]} $@"
