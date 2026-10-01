@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instale o Node.js 24 e tente novamente.
  pause
  exit /b 1
)
node scripts/start.cjs
pause
