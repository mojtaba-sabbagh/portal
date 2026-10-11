@echo off
setlocal EnableExtensions EnableDelayedExpansion

:: ===========================================================================
:: build-docker-image.bat  -  Windows 11 batch equivalent of:
::     docker build -t portal-app portal
::     docker save -o portal.tar portal-app
::
:: Usage:
::     build-docker-image.bat                    (uses the defaults below)
::     build-docker-image.bat my-app my-app.tar  (override image / archive)
::     build-docker-image.bat --check            (verify Docker only)
::     build-docker-image.bat --help
::
:: Run by double-clicking, or from a terminal (cmd / PowerShell):
::     cmd /c build-docker-image.bat
:: ===========================================================================

:: ---- Configuration (edit here if needed) ----------------------------------
set "IMAGE_NAME=portal-app"
set "TAR_FILE=portal.tar"
set "BUILD_CONTEXT=."
:: ---------------------------------------------------------------------------

:: Work from the folder that contains this script so the relative paths above
:: resolve exactly like the original shell script did.
pushd "%~dp0"
if errorlevel 1 (
    echo [ERROR] Cannot switch to the script directory "%~dp0".
    exit /b 1
)

if /I "%~1"=="--help"  goto :usage
if /I "%~1"=="-h"      goto :usage
if /I "%~1"=="--check" goto :check

if not "%~1"=="" set "IMAGE_NAME=%~1"
if not "%~2"=="" set "TAR_FILE=%~2"

echo ===========================================================================
echo  Portal Docker image build
echo ===========================================================================
echo  Working folder : %CD%
echo  Build context  : %BUILD_CONTEXT%
echo  Image name     : %IMAGE_NAME%
echo  Output archive : %TAR_FILE%
echo ===========================================================================
echo.

:: ---- 0) Verify Docker is installed and the engine is running --------------
where docker >nul 2>&1
if errorlevel 1 (
    echo [ERROR] "docker" was not found in PATH.
    echo         Install Docker Desktop for Windows and reopen the terminal.
    goto :fail
)

:: "call" is required so that Docker CLI wrappers ending in .cmd/.bat return
:: control to this script instead of terminating it.
call docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] The Docker engine is not running.
    echo         Start Docker Desktop, wait for "Engine running", then retry.
    goto :fail
)

:: ---- 1) Build the image ---------------------------------------------------
echo [1/2] docker build -t "%IMAGE_NAME%" %BUILD_CONTEXT%
call docker build -t "%IMAGE_NAME%" "%BUILD_CONTEXT%"
if errorlevel 1 (
    echo [ERROR] "docker build" failed - see the output above.
    goto :fail
)
echo.

:: ---- 2) Export the image to a tar archive ---------------------------------
echo [2/2] docker save -o "%TAR_FILE%" "%IMAGE_NAME%"
call docker save -o "%TAR_FILE%" "%IMAGE_NAME%"
if errorlevel 1 (
    echo [ERROR] "docker save" failed - see the output above.
    goto :fail
)
echo.

if not exist "%TAR_FILE%" (
    echo [ERROR] Archive "%TAR_FILE%" was not created.
    goto :fail
)

for %%F in ("%TAR_FILE%") do set "TAR_SIZE=%%~zF"

echo ===========================================================================
echo  SUCCESS
echo ===========================================================================
echo  Image   : %IMAGE_NAME%
echo  Archive : %CD%\%TAR_FILE%  (!TAR_SIZE! bytes)
echo ===========================================================================
echo.
echo  Copy "%TAR_FILE%" to the server, then run:
echo      docker load -i "%TAR_FILE%"
echo.

popd
endlocal
exit /b 0

:check
echo Checking Docker availability ...
where docker >nul 2>&1
if errorlevel 1 (
    echo [FAIL] "docker" was not found in PATH.
    popd
    endlocal
    exit /b 1
)
call docker info >nul 2>&1
if errorlevel 1 (
    echo [FAIL] The Docker engine is not running.
    popd
    endlocal
    exit /b 1
)
echo [ OK ] Docker is installed and the engine is running.
echo        Default image   : %IMAGE_NAME%
echo        Default archive : %TAR_FILE%
echo        Build context   : %CD%\%BUILD_CONTEXT%
popd
endlocal
exit /b 0

:usage
echo Builds the Portal Docker image and exports it to a tar archive.
echo.
echo Usage:
echo     %~nx0 [image-name] [tar-file]
echo     %~nx0 --check
echo     %~nx0 --help
echo.
echo Defaults:
echo     image-name = portal-app
echo     tar-file   = portal.tar
echo.
popd
endlocal
exit /b 0

:fail
echo.
echo Build aborted.
popd
endlocal
exit /b 1
