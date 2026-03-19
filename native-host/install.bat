@echo off
setlocal enabledelayedexpansion

echo =============================================
echo  Blank New Tab - Native Host Installer
echo =============================================
echo.

:: Get the directory this script is in
set "HOSTDIR=%~dp0"
set "HOSTDIR=%HOSTDIR:~0,-1%"

:: Compile the C# native messaging host
echo Compiling ToggleBookmarks.exe...
C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe /nologo /out:"%HOSTDIR%\ToggleBookmarks.exe" "%HOSTDIR%\ToggleBookmarks.cs"
if errorlevel 1 (
    echo ERROR: Compilation failed.
    pause
    exit /b 1
)
echo Compiled successfully.
echo.

:: Ask for extension ID
echo Open chrome://extensions, enable Developer Mode, and find your extension ID.
set /p EXTID="Enter your extension ID: "

:: Build escaped path for JSON
set "EXEPATH=%HOSTDIR%\ToggleBookmarks.exe"
set "EXEPATH_ESC=%EXEPATH:\=\\%"

:: Write the native messaging host manifest using Python for reliable JSON
python -c "import json,sys; json.dump({'name':'com.blanktab.togglebar','description':'Toggles Chrome bookmarks bar','path':sys.argv[1],'type':'stdio','allowed_origins':['chrome-extension://'+sys.argv[2]+'/']},open(sys.argv[3],'w'),indent=2)" "%EXEPATH%" "%EXTID%" "%HOSTDIR%\com.blanktab.togglebar.json"
if errorlevel 1 (
    echo Python failed, writing manifest manually...
    > "%HOSTDIR%\com.blanktab.togglebar.json" (
        echo {
        echo   "name": "com.blanktab.togglebar",
        echo   "description": "Toggles Chrome bookmarks bar",
        echo   "path": "%EXEPATH_ESC%",
        echo   "type": "stdio",
        echo   "allowed_origins": ["chrome-extension://%EXTID%/"]
        echo }
    )
)
echo Manifest written.
echo.

:: Register in Windows registry
echo Registering native messaging host...
reg add "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.blanktab.togglebar" /ve /t REG_SZ /d "%HOSTDIR%\com.blanktab.togglebar.json" /f
if errorlevel 1 (
    echo ERROR: Registry write failed.
    pause
    exit /b 1
)
echo.
echo =============================================
echo  Installation complete!
echo  Restart Chrome for changes to take effect.
echo  Make sure bookmarks bar starts HIDDEN
echo  (Ctrl+Shift+B to hide if visible).
echo =============================================
pause
