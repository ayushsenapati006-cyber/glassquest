@echo off
cd /d "%~dp0"
echo Checking that Ollama is installed and running...
ollama list
if errorlevel 1 (
  echo Ollama command failed. Install Ollama and reopen this window.
  pause
  exit /b 1
)
echo.
echo Starting GrassQuest local server...
node server.js
pause
