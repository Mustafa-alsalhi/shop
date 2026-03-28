@echo off
echo Starting upload to GitHub...
echo.

cd "C:\Users\ALBAHA\Desktop\my store"
echo Removing old remote...
"C:\Program Files\Git\bin\git.exe" remote remove origin

echo Adding new remote...
"C:\Program Files\Git\bin\git.exe" remote add origin https://github.com/mustafaalsalhi065-crypto/storee.git

echo Pushing to GitHub...
"C:\Program Files\Git\bin\git.exe" push -u origin main

echo.
echo Upload completed!
echo.
echo Your project is now available at: https://github.com/mustafaalsalhi065-crypto/storee
echo.
pause
