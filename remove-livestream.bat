@echo off
echo ========================================
echo QORVO - Remove Old Livestream Files
echo ========================================
echo.

if exist "livestream.html" (
    del /f /q "livestream.html"
    echo Deleted: livestream.html
) else (
    echo Already removed: livestream.html
)

if exist "adminlivestreaming.html" (
    del /f /q "adminlivestreaming.html"
    echo Deleted: adminlivestreaming.html
) else (
    echo Already removed: adminlivestreaming.html
)

if exist "TURN_SERVER_SETUP.md" (
    del /f /q "TURN_SERVER_SETUP.md"
    echo Deleted: TURN_SERVER_SETUP.md
) else (
    echo Already removed: TURN_SERVER_SETUP.md
)

echo.
echo Adding changes to Git...
git add -A

echo.
echo Committing WEB v7.57...
git commit -m "Remove private livestreaming - WEB v7.57"

echo.
echo Pulling latest changes...
git pull --rebase origin main

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo DONE - Livestreaming removed
echo ========================================
pause