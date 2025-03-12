#!/bin/bash
# Project Structure Analysis Script for Replit

echo "===== PROJECT STRUCTURE ANALYSIS ====="
echo "Analyzing the current project structure..."

# Check if it's a Python project
if [ -f "requirements.txt" ]; then
  echo "[DETECTED] Python project (requirements.txt found)"
  echo "Python packages required:"
  cat requirements.txt
fi

# Check if it's a Node.js project
if [ -f "package.json" ]; then
  echo "[DETECTED] Node.js project (package.json found)"
  echo "Node.js details:"
  cat package.json | grep -E "name|version|main|scripts"
fi

# Check for other common project types
if [ -f "Gemfile" ]; then
  echo "[DETECTED] Ruby project (Gemfile found)"
fi

if [ -f "go.mod" ]; then
  echo "[DETECTED] Go project (go.mod found)"
fi

# Check for web frameworks
if [ -d "public" ] || [ -d "static" ]; then
  echo "[DETECTED] Static web assets directory"
fi

# Check entry point files
echo "Checking for common entry points:"
for file in app.py index.js main.py server.js app.js; do
  if [ -f "$file" ]; then
    echo "- Found potential entry point: $file"
  fi
done

# Check for configuration files
echo "Configuration files found:"
for file in .env .gitignore .replit config.json .babelrc; do
  if [ -f "$file" ]; then
    echo "- Found config file: $file"
  fi
done

echo "===== ANALYSIS COMPLETE ====="
echo "Use this information to configure your Replit setup correctly."
