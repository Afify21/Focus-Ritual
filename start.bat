@echo off
echo Starting Focus Ritual Application...

echo Starting Backend Server...
start cmd /k "cd backend && npm start"

echo Starting Frontend Application...
start cmd /k "cd frontend && npm run dev"

echo Both servers are starting! The application should open in your browser automatically. 