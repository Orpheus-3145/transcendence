#!/bin/bash

# Exit if any command fails
set -e

file_name="${1-cert}"
key_file="${file_name}.key"
crt_file="${file_name}.crt"

destination="${2:-./ssl}"

if [ -d ${destination} ]; then        # if destination exists, check if there are the cert files

    if [[ -f "${destination}/${key_file}" && -f "${destination}/${crt_file}" ]]; then

        # cert files exist already, stop right here
        echo "files ${key_file} and ${crt_file} already exist"
        exit 0
    fi
else

    mkdir -p "${destination}"
fi

# Check if openssl is installed
if [[ `command -v openssl | wc -l` == 0 ]]; then

    echo "openssl package not installed" >&2
    exit 1
else

    echo "openssl package installed" >&2
fi

openssl req -x509 -nodes -newkey rsa:4096 \
	-keyout "${key_file}" \
	-out "${crt_file}" \
	-days 365 \
	-subj "/CN=${file_name}"

chmod 600 "${key_file}"
mv "${key_file}" "${destination}/"

chmod 644 "${crt_file}"
mv "${crt_file}" "${destination}/"