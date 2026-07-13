@echo off
REM Maven Wrapper script for Windows
REM Downloads Maven if not found and runs it

setlocal

set "MAVEN_PROJECTBASEDIR=%~dp0"
set "MAVEN_WRAPPER_PROPERTIES=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.properties"
set "MAVEN_HOME=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven"

if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
    echo Downloading Maven...
    mkdir "%MAVEN_HOME%" 2>nul

    for /f "tokens=1,* delims==" %%a in ('findstr "distributionUrl" "%MAVEN_WRAPPER_PROPERTIES%"') do set "distributionUrl=%%b"

    powershell -Command "Invoke-WebRequest -Uri '%distributionUrl%' -OutFile '%MAVEN_HOME%\maven.zip'"
    powershell -Command "Expand-Archive -Path '%MAVEN_HOME%\maven.zip' -DestinationPath '%MAVEN_HOME%' -Force"
    del "%MAVEN_HOME%\maven.zip"

    for /d %%i in ("%MAVEN_HOME%\apache-maven-*") do (
        xcopy /s /e /y "%%i\*" "%MAVEN_HOME%\" >nul
        rmdir /s /q "%%i"
    )
)

"%MAVEN_HOME%\bin\mvn.cmd" %*
