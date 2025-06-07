@echo off
echo Killing processes on common development ports...

FOR %%p IN (3000 3001 4000 5000 8000 8080 9000) DO (
  FOR /F "tokens=5" %%a IN ('netstat -ano ^| findstr :%%p ^| findstr LISTENING') DO (
    echo Found process using port %%p with PID: %%a
    taskkill /F /PID %%a 2>nul
    IF NOT ERRORLEVEL 1 echo Killed process %%a on port %%p
  )
)

echo.
echo Killing Node.js processes...
taskkill /F /IM node.exe 2>nul
IF NOT ERRORLEVEL 1 (
  echo Node.js processes terminated!
) ELSE (
  echo No Node.js processes found or could not terminate them.
)

echo.
echo Killing npm processes...
taskkill /F /IM npm.cmd 2>nul
IF NOT ERRORLEVEL 1 (
  echo npm processes terminated!
) ELSE (
  echo No npm processes found or could not terminate them.
)

echo.
echo Done! 