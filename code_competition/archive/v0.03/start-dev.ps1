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
    # If any process is already listening on the port, stop it first
    try {
        $listeners = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        if ($listeners) {
            $pids = $listeners | Select-Object -ExpandProperty OwningProcess -Unique
            Write-Host "Found existing process(es) on port $port: $($pids -join ', '). Stopping..."
            foreach ($pid in $pids) {
                try { Stop-Process -Id $pid -ErrorAction SilentlyContinue } catch {}
            }
            Start-Sleep -Seconds 1
            # double-check and force if necessary
            $still = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
            if ($still) {
                $pids2 = $still | Select-Object -ExpandProperty OwningProcess -Unique
                Write-Host "Forcing stop of remaining PIDs: $($pids2 -join ', ')"
                foreach ($pid in $pids2) { try { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue } catch {} }
            }
        }
    } catch {}

    # Launch Python http.server with the script directory as its working directory
    $serverProcess = Start-Process -FilePath python -ArgumentList "-m", "http.server", "$port" -WorkingDirectory $scriptDir -WindowStyle Hidden -PassThru
    Start-Sleep -Seconds 1
    Write-Host ""
    Write-Host "Python HTTP Server running on port $port (PID: $($serverProcess.Id))" -ForegroundColor Green
    Start-Process "http://localhost:$port/index.html"
    
    Write-Host ""
    Write-Host "Press any key to stop the server and close..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    # Stop the server
    Write-Host ""
    Write-Host "Stopping server (PID: $($serverProcess.Id))..." -ForegroundColor Yellow
    if (-not $serverProcess.HasExited) {
        Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }
    
    # Double-check and cleanup any remaining processes on the port
    try {
        $remaining = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        if ($remaining) {
            $pids = $remaining | Select-Object -ExpandProperty OwningProcess -Unique
            Write-Host "Cleaning up remaining processes on port $port : $($pids -join ', ')" -ForegroundColor Yellow
            foreach ($pid in $pids) {
                try { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue } catch {}
            }
        }
    } catch {}
    
    Write-Host "Cleanup complete." -ForegroundColor Green
} Catch {
    Write-Host "Unable to start Python http server. Make sure Python 3 is installed and in your PATH and run this script from the project directory if needed." -ForegroundColor Yellow
    Write-Host "Alternatives: 'npx http-server -p 8000' (Node) or use the Live Server VS Code extension." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to close..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
