#!/bin/bash
# Replit Troubleshooting Script

echo "===== REPLIT DEPLOYMENT TROUBLESHOOTING ====="
echo "Running diagnostics on $(date)"

# Check system info
echo -e "\n=== SYSTEM INFO ==="
echo "Replit username: $REPL_OWNER"
echo "Repl ID: $REPL_ID"
echo "Repl Slug: $REPL_SLUG"
echo "Available disk space:"
df -h | grep "/home"

# Check file permissions
echo -e "\n=== FILE PERMISSIONS ==="
for file in run.sh .replit; do
  if [ -f "$file" ]; then
    ls -l "$file"
    if [ ! -x "$file" ] && [[ "$file" == *.sh ]]; then
      echo "Warning: $file is not executable. Run 'chmod +x $file'"
    fi
  else
    echo "Warning: $file does not exist"
  fi
done

# Check Python environment
echo -e "\n=== PYTHON ENVIRONMENT ==="
if [ -d "env" ]; then
  echo "Python virtual environment exists"
  if [ -f "env/bin/activate" ]; then
    source env/bin/activate
    echo "Python version: $(python --version 2>&1)"
    echo "Pip version: $(pip --version 2>&1)"
    echo "Installed packages:"
    pip list
  else
    echo "Warning: Virtual environment exists but activation script is missing"
  fi
else
  echo "Warning: Python virtual environment 'env' not found"
  echo "Python version (system): $(python --version 2>&1)"
fi

# Check Node.js environment
echo -e "\n=== NODE.JS ENVIRONMENT ==="
if command -v node &>/dev/null; then
  echo "Node.js version: $(node --version)"
  echo "NPM version: $(npm --version)"
  if [ -d "node_modules" ]; then
    echo "node_modules directory exists with $(find node_modules -type d | wc -l) directories"
  else
    echo "Warning: node_modules directory not found"
  fi
else
  echo "Warning: Node.js not found in PATH"
fi

# Check for common build directories
echo -e "\n=== BUILD DIRECTORIES ==="
for dir in build dist public static; do
  if [ -d "$dir" ]; then
    echo "$dir exists with $(find $dir -type f | wc -l) files"
  else
    echo "$dir does not exist"
  fi
done

# Check for potential port conflicts
echo -e "\n=== PORT USAGE ==="
if command -v lsof &>/dev/null; then
  echo "Checking ports 3000, 5000, 8000, 8080:"
  lsof -i :3000,5000,8000,8080
else
  echo "lsof not available, skipping port check"
fi

# Check for any error logs
echo -e "\n=== ERROR LOGS ==="
if [ -f "error.log" ]; then
  echo "Last 10 lines of error.log:"
  tail -10 error.log
else
  echo "No error.log file found"
fi

# Check for common issue patterns in package.json
echo -e "\n=== PACKAGE.JSON ISSUES ==="
if [ -f "package.json" ]; then
  if ! grep -q '"files"' package.json; then
    echo "Warning: 'files' section missing in package.json"
  fi
  if ! grep -q '"main"' package.json; then
    echo "Warning: 'main' field missing in package.json"
  fi
  if ! grep -q '"start"' package.json; then
    echo "Warning: 'start' script missing in package.json"
  fi
else
  echo "No package.json file found"
fi

echo -e "\n===== TROUBLESHOOTING COMPLETE ====="
echo "If you're still experiencing issues, check the Replit forums or documentation."
