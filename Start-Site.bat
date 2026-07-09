@echo off
setlocal

set "ROOT=%~dp0"
set "NODE=C:\Users\joshs\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "SCRIPT=%ROOT%_tee-dev\scripts\serve-with-log.js"

if not exist "%NODE%" set "NODE=node"

echo Starting Tee Dev at http://localhost:4173
start "Tee Dev Server" /min "%NODE%" "%SCRIPT%"

echo.
echo Site started. Open http://localhost:4173 in your browser.
echo Use Stop-Site.bat to stop it.
