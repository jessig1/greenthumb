<#
.SYNOPSIS
  Force-stops processes by executable name whose command line contains a given substring.

.DESCRIPTION
  Used by the dev Makefiles to stop the backend/frontend without relying on PID files -
  mvnw/npm wrap the real process (java.exe / node.exe), so a PID captured from `mvnw &`
  is the wrapper's PID, not the JVM/Node process it launches. Matching by command line
  finds the real process directly. Safe to run when nothing matches - it just no-ops.

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts/stop-process.ps1 -ProcessName java.exe -CommandLineMatch backend
#>
param(
    [Parameter(Mandatory = $true)][string]$ProcessName,
    [Parameter(Mandatory = $true)][string]$CommandLineMatch
)

$processes = Get-CimInstance Win32_Process -Filter "Name='$ProcessName'" |
    Where-Object { $_.CommandLine -like "*$CommandLineMatch*" }

if (-not $processes) {
    Write-Host "No matching $ProcessName process found (looking for '$CommandLineMatch')."
    exit 0
}

foreach ($process in $processes) {
    Write-Host "Stopping $ProcessName (PID $($process.ProcessId))"
    Stop-Process -Id $process.ProcessId -Force
}
