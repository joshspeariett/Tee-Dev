@echo off
setlocal enabledelayedexpansion

set "SEEN="

for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":4173" ^| findstr "LISTENING"') do (
  echo !SEEN! | findstr /C:" %%P " >nul
  if errorlevel 1 (
    set "SEEN=!SEEN! %%P "
    echo Stopping Tee Dev server on PID %%P
    taskkill /PID %%P /F >nul
  )
)

if not defined SEEN (
  echo No Tee Dev server is listening on port 4173.
) else (
  echo Tee Dev server stopped.
)
