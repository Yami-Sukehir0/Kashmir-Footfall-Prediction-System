#!/bin/bash
# Quick start script for Kashmir Tourism Platform

echo "🏔️  Starting Kashmir Tourism Platform..."

# Start MongoDB
echo "📊 Starting MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    mongod &
fi

# Start Python ML API
echo "🤖 Starting Python ML Service..."
cd backend
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null
python app.py &
ML_PID=$!
cd ..

# Wait for ML service
sleep 3

# Start Node.js API
echo "⚙️  Starting Node.js API..."
cd server
npm run dev &
NODE_PID=$!
cd ..

# Wait for Node API
sleep 3

# Start React Frontend
echo "⚛️  Starting React Frontend..."
cd client
npm start &
REACT_PID=$!
cd ..

echo "✅ All services started!"
echo ""
echo "📍 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Node API: http://localhost:3001"
echo "   ML API:   http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all services"

# Trap Ctrl+C
trap "kill $ML_PID $NODE_PID $REACT_PID; exit" INT

wait
