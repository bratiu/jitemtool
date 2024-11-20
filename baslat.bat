@echo off
:restart
node index.js
if %errorlevel% equ 123 goto restart
echo Node.js script terminated.
pause
