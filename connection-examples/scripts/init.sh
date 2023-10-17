#!/bin/bash

##
# Run the file with bash init.sh
##

# File list
files="connection insert query source subscribe views"

# Function to ask for language or framework name
function init() {
    read -p "The name of the language or framework: [eg. python] " name
    while [[ -z ${name} ]]; do
        read -p "The name of the language or framework: [eg. python] " name
    done
    echo ${name}
    slug=$(slugify ${name})
    echo "Folder name: ${slug}"

    # Check if folder already exists
    if [[ -d ${slug} ]]; then
        echo "Folder already exists: ${slug}"
        exit 1
    fi

    read -p "The file extension: [eg. py] " extension
    while [[ -z ${extension} ]]; do
        read -p "The file extension: [eg. py] " extension
    done
    echo "File extension: ${extension}"

    mkdir ${slug}
    echo "Folder created: ${slug}"

    # Create the files
    for file in ${files}; do
        touch ${slug}/${file}.${extension}
        echo "File created: ${slug}/${file}.${extension}"
    done
    echo "# Materialize + ${name} Example" > ${slug}/README.md

    echo "Folder structure:"
    ls -l ${slug}

    echo "Complete!"

}

# Function to slugify the language name
function slugify() {
    echo $1 | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g' | sed -E 's/^-+|-+$//g'
}

# Init the script
init
