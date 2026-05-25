@echo off
echo Syncing updates to GitHub...
cd /d "%~dp0"

:: Stage all changes
git add .

:: Commit with a timestamp
git commit -m "Auto-sync update %date% %time%"

:: Push to GitHub
git push

echo.
echo ----------------------------------------
echo Sync Complete! Your website should update in 1-2 minutes.
echo ----------------------------------------
pause
