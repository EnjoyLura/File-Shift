#!/bin/bash
TOKEN=$(curl -s http://localhost:3001/api/v1/auth/login -H 'Content-Type: application/json' -d '{"email":"testdownload@example.com","password":"Test1234"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["data"]["accessToken"])')
echo "TOKEN: ${TOKEN:0:50}..."
curl -s -o /tmp/test_dl.jpg -D /tmp/test_headers.txt http://localhost:3001/api/v1/files/download/T20260606224709012U -H "Authorization: Bearer $TOKEN"
echo "=== Response Headers ==="
cat /tmp/test_headers.txt
echo "=== File Type ==="
file /tmp/test_dl.jpg
echo "=== File Size ==="
ls -la /tmp/test_dl.jpg
