@echo off
echo Removing native messaging host registration...
reg delete "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.blanktab.togglebar" /f 2>nul
echo Done.
pause
