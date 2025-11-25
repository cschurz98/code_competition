<#
  Start the project quickly for local development on Windows.
  Requirements: Python 3 in PATH (falls back to a helpful message if not found).

  Usage: Open PowerShell in the project directory and run:
    .\start-dev.ps1
#>
$port = 8000

# Determine the script's directory so the server serves files from the project folder
# This prevents launching the server from a different working directory (e.g. when double-clicking the script)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
if (-not $scriptDir -or -not (Test-Path $scriptDir)) {
    # Fallback to the current working directory when running from interactive session
    $scriptDir = Get-Location
}

Try {
    # Launch Python http.server with the script directory as its working directory
    Start-Process -FilePath python -ArgumentList "-m", "http.server", "$port" -WorkingDirectory $scriptDir -WindowStyle Minimized
    Start-Sleep -Seconds 1
    Start-Process "http://localhost:$port/index.html"
} Catch {
    Write-Host "Unable to start Python http server. Make sure Python 3 is installed and in your PATH and run this script from the project directory if needed." -ForegroundColor Yellow
    Write-Host "Alternatives: 'npx http-server -p 8000' (Node) or use the Live Server VS Code extension." -ForegroundColor Yellow
}
