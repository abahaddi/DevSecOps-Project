<#
.SYNOPSIS
Starts all DevSecOps Chatroom services on Windows.

.DESCRIPTION
This PowerShell script starts the auth service, file service, Go backend, and frontend
in parallel and tracks their process IDs so it can stop them cleanly.

.Notes
Run with PowerShell 7+ if possible, but it also works on Windows PowerShell 5.1.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

function Write-Info($message) {
    Write-Host "[INFO] $message" -ForegroundColor Cyan
}

function Write-Success($message) {
    Write-Host "[OK]   $message" -ForegroundColor Green
}

function Write-ErrorMsg($message) {
    Write-Host "[ERR]  $message" -ForegroundColor Red
}

function Test-PortInUse {
    param([int]$Port)

    try {
        $properties = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties()
        $listeners = $properties.GetActiveTcpListeners()
        foreach ($listener in $listeners) {
            if ($listener.Port -eq $Port) { return $true }
        }
    } catch {
        return $false
    }
    return $false
}

function Assert-PortFree {
    param(
        [int]$Port,
        [string]$ServiceName
    )

    if (Test-PortInUse -Port $Port) {
        Write-ErrorMsg "$ServiceName port $Port is already in use."
        Write-Host "Please stop the process listening on port $Port or choose a different port."
        exit 1
    }
}

function Get-PythonExecutable {
    param([string]$BaseDir)

    $expected = Join-Path -Path $BaseDir -ChildPath 'env\Scripts\python.exe'
    if (Test-Path $expected) { return $expected }
    return 'python'
}

function Start-ServiceProcess {
    param(
        [string]$ServiceName,
        [string]$FilePath,
        [string[]]$Arguments,
        [string]$WorkingDirectory
    )

    Write-Info "Starting $ServiceName..."

    $process = Start-Process -FilePath $FilePath -ArgumentList $Arguments -WorkingDirectory $WorkingDirectory -NoNewWindow -PassThru
    if (-not $process) {
        throw "Failed to start $ServiceName"
    }

    Write-Success "$ServiceName started (PID: $($process.Id))"
    return $process
}

function Cleanup {
    if ($global:ServiceProcesses.Count -gt 0) {
        Write-Host "`nStopping services..."
        foreach ($proc in $global:ServiceProcesses) {
            if (-not $proc.HasExited) {
                try {
                    $proc | Stop-Process -Force -ErrorAction SilentlyContinue
                    Write-Host "Stopped PID $($proc.Id)"
                } catch {
                    Write-Host "Unable to stop PID $($proc.Id): $_"
                }
            }
        }
    }
}

function Wait-ForProcesses {
    foreach ($proc in $global:ServiceProcesses) {
        try {
            Wait-Process -Id $proc.Id
        } catch {
            # ignore if the process already exited
        }
    }
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$global:ServiceProcesses = @()

try {
    Write-Host "🚀 Starting DevSecOps Chatroom Services...`n"

    Assert-PortFree -Port 3001 -ServiceName 'Auth Service'
    Push-Location "$scriptDir\auth-service"
    Write-Info 'Installing Auth Service dependencies...'
    Start-Process -FilePath npm -ArgumentList 'install' -NoNewWindow -Wait
    $authProc = Start-ServiceProcess -ServiceName 'Auth Service' -FilePath npm -Arguments @('start') -WorkingDirectory "$scriptDir\auth-service"
    $global:ServiceProcesses += $authProc
    Pop-Location

    Start-Sleep -Seconds 2

    Assert-PortFree -Port 3002 -ServiceName 'File Service'
    $pythonExe = Get-PythonExecutable -BaseDir "$scriptDir\file-service"
    Push-Location "$scriptDir\file-service"
    Write-Info 'Installing File Service dependencies...'
    Start-Process -FilePath $pythonExe -ArgumentList '-m', 'pip', 'install', '-r', 'requirements.txt' -NoNewWindow -Wait
    $fileProc = Start-ServiceProcess -ServiceName 'File Service' -FilePath $pythonExe -Arguments @('server.py') -WorkingDirectory "$scriptDir\file-service"
    $global:ServiceProcesses += $fileProc
    Pop-Location

    Start-Sleep -Seconds 2

    Assert-PortFree -Port 8080 -ServiceName 'WebSocket Server'
    Push-Location "$scriptDir\backend"
    $goProc = Start-ServiceProcess -ServiceName 'WebSocket Server' -FilePath go -Arguments @('run', '*.go') -WorkingDirectory "$scriptDir\backend"
    $global:ServiceProcesses += $goProc
    Pop-Location

    Start-Sleep -Seconds 2

    Assert-PortFree -Port 5173 -ServiceName 'Frontend'
    Push-Location "$scriptDir\frontend"
    Write-Info 'Installing Frontend dependencies...'
    Start-Process -FilePath npm -ArgumentList 'install' -NoNewWindow -Wait
    $frontendProc = Start-ServiceProcess -ServiceName 'Frontend' -FilePath npm -Arguments @('run', 'dev') -WorkingDirectory "$scriptDir\frontend"
    $global:ServiceProcesses += $frontendProc
    Pop-Location

    Write-Host "`n${([char]0x2714])} All services are running!`
"
    Write-Host 'Services:'
    Write-Host '  Auth Service:      http://localhost:3001'
    Write-Host '  File Service:      http://localhost:3002'
    Write-Host '  WebSocket Server:  http://localhost:8080'
    Write-Host '  Frontend:          http://localhost:5173'`n

    Write-Host 'Press Ctrl+C to stop all services.'
    Wait-ForProcesses
} catch {
    Write-ErrorMsg "$_"
    Cleanup
    exit 1
} finally {
    if ($global:ServiceProcesses.Count -gt 0) {
        Cleanup
    }
}
