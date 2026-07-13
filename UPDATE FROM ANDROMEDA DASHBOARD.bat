@echo off
setlocal
set "SRC=C:\Andromeda\Dashboard\Andromeda_Dashboard.html"
set "DEST=%~dp0index.html"

if not exist "%SRC%" (
  echo Dashboard not found:
  echo %SRC%
  echo.
  echo Run Andromeda first, then try again.
  pause
  exit /b 1
)

copy /Y "%SRC%" "%DEST%" >nul
echo Updated:
echo %DEST%
echo.
echo Now commit/upload index.html to the GitHub repository.
pause
