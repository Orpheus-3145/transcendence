#!/bin/bash

# Exit if any command fails
set -e

filename="${1:-cert}"

# Check if openssl is installed, install if not
if [! command -v openssl &> /dev/null]; then
    sudo apt update
    sudo apt install -y openssl
fi

# Move files to destination directory
destination=${2:-./ssl}
mkdir -p "$destination"

openssl req -x509 -nodes -newkey rsa:4096 \
	-keyout "$filename.tmp.key" \
	-out "$filename.tmp.crt" \
	-days 365 \
	-subj "/CN=$filename.tmp"

# Check if .crt and .key files already exist, move them if they don't
if [ ! -e "$destination/$filename.crt" ]; then
    mv "$filename.tmp.crt" "$destination/$filename.crt"
    chmod 644 "$destination/$filename.crt"
fi

if [ ! -e "$destination/$filename.key" ]; then
    mv "$filename.tmp.key" "$destination/$filename.key"
    chmod 600 "$destination/$filename.key"
fi

# Remove tmp files incase of allready existing
rm -rf $filename.tmp.crt $filename.tmp.key