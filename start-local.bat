@echo off
REM Starts a local web server for the website and opens it in the browser.
REM Stop the server by closing this window (or Ctrl+C).
cd /d "%~dp0"
start "" http://localhost:8000/index.html
py -m http.server 8000 2>nul || python -m http.server 8000
