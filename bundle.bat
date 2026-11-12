@echo off
setlocal

pushd web_ui
call npm run build
if errorlevel 1 exit /b %errorlevel%
popd

pyinstaller build_exe.spec --distpath dist --workpath build --noconfirm
if errorlevel 1 exit /b %errorlevel%

if exist dist\web_ui rmdir /S /Q dist\web_ui
mkdir dist\web_ui
copy /Y web_ui\index.html dist\web_ui\index.html >nul
xcopy web_ui\static dist\web_ui\static\ /E /I /Y >nul
xcopy web_ui\dist dist\web_ui\dist\ /E /I /Y >nul

echo @echo off> dist\run-game-server.bat
echo .\tech-game\tech-game.exe>> dist\run-game-server.bat

echo @echo off> dist\run-http-server.bat
echo cd /D "%%~dp0web_ui">> dist\run-http-server.bat
echo python -m http.server 5501>> dist\run-http-server.bat

echo Build completed in dist\
