#!/bin/bash

# Test the admin API directly
echo "Testing admin API..."

ADMIN_KEY=$(grep ADMIN_KEY .dev.vars | cut -d'"' -f2)

if [ -z "$ADMIN_KEY" ]; then
  echo "ERROR: ADMIN_KEY not found in .dev.vars"
  exit 1
fi

echo "Admin key loaded: ${ADMIN_KEY:0:10}..."
echo ""
echo "Calling adminGetStats..."

curl -X POST http://localhost:4321/_actions/adminGetStats \
  -H "Content-Type: application/json" \
  -d "{\"adminKey\": \"$ADMIN_KEY\"}" \
  | python3 -m json.tool 2>/dev/null || echo "Failed to parse JSON response"

echo ""
echo ""
echo "Calling adminGetAllComments..."

curl -X POST http://localhost:4321/_actions/adminGetAllComments \
  -H "Content-Type: application/json" \
  -d "{\"adminKey\": \"$ADMIN_KEY\", \"status\": \"all\", \"limit\": 50}" \
  | python3 -m json.tool 2>/dev/null || echo "Failed to parse JSON response"

