#!/bin/bash

# Simple test script for the math worksheet generator

echo "🧮 Math Worksheet Generator Test Script"
echo "======================================="

# Check if server is running
echo "📡 Starting local server..."
python3 -m http.server 8000 &
SERVER_PID=$!

# Wait a moment for server to start
sleep 2

# Check if server is responding
if curl -s http://localhost:8000 > /dev/null; then
    echo "✅ Server is running on http://localhost:8000"
    echo "🏠 Testing House Problems feature:"
    echo "   1. Open http://localhost:8000 in your browser"
    echo "   2. Click on 'House Number Problems' topic card"
    echo "   3. Select number range (1-10 for testing)"
    echo "   4. Set number of problems (5-10 for testing)"
    echo "   5. Click 'Generate Worksheet'"
    echo ""
    echo "Expected: You should see houses with numbers on roofs and '?' for missing numbers"
    echo ""
    echo "🌐 Opening browser..."
    open http://localhost:8000

    echo ""
    echo "Press any key to stop the server..."
    read -n 1 -s

    echo "🛑 Stopping server..."
    kill $SERVER_PID
    echo "✅ Server stopped"
else
    echo "❌ Failed to start server"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi