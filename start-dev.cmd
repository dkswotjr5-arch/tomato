@echo off
cd /d "%~dp0"
echo Starting Tomato Square...
echo.
echo Open this URL after the server says Ready:
echo http://localhost:3000
echo.
call npm.cmd run dev
pause