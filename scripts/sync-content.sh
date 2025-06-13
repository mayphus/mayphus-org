#!/bin/bash

# Sync content from ~/workspaces/org to content/ directory
# This replicates the CI workflow "Prepare content" step locally

echo "Syncing content from ~/workspaces/org..."

# Check if source directory exists
if [ ! -d "$HOME/workspaces/org" ]; then
    echo "Error: ~/workspaces/org directory not found"
    exit 1
fi

# Create content directory if it doesn't exist
mkdir -p content

# Remove existing content (except .gitkeep if it exists)
find content -name "*.org" -delete

# Copy org files from workspace
cp ~/workspaces/org/*.org content/ 2>/dev/null || echo "No .org files found in ~/workspaces/org"

# Remove README.org if it exists (following CI workflow)
rm -f content/README.org

echo "Content synced successfully!"
echo "Found $(ls content/*.org 2>/dev/null | wc -l) .org files"