<#
.SYNOPSIS
  Force-stops dev-server processes, by command line match and/or by whatever's bound to a port.

.DESCRIPTION
  Used by the dev Makefiles to stop the backend/frontend/db without relying on PID files -
  mvnw/npm wrap the real process (java.exe / node.exe), so a PID captured from `mvnw &`
  is the wrapper's PID, not the JVM/Node process it launches. Matching by command line
  finds the real process directly.

  Command-line matching alone isn't reliable: an orphaned child process (eg a stray Vite/esbuild
  worker left behind when its parent died) can still be listening on the dev port without its own
  command line containing the expected substring, silently squatting on the port so the next
  `start` binds a different one instead (eg frontend falling back to :5174, which then trips CORS
  since the backend only allow-lists :5173). Passing -Port additionally kills whatever process (if
  any) is actually listening on that port, regardless of name/command line, as a fallback net.

  Safe to run when nothing matches on either check - it just no-ops. Requires at least one of
  (-ProcessName + -CommandLineMatch) or -Port.

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts/stop-process.ps1 -ProcessName java.exe -CommandLineMatch backend -Port 8080

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts/stop-process.ps1 -Port 5432
#>
param(
    [string]$ProcessName,
    [string]$CommandLineMatch,
    [int]$Port
)

$stoppedIds = @{}

function Stop-ProcessOnce {
    param([int]$TargetId, [string]$Reason)
    if ($stoppedIds.ContainsKey($TargetId)) { return }
    Write-Host "Stopping PID $TargetId ($Reason)"
    Stop-Process -Id $TargetId -Force -ErrorAction SilentlyContinue
    $stoppedIds[$TargetId] = $true
}

if ($ProcessName -and $CommandLineMatch) {
    Get-CimInstance Win32_Process -Filter "Name='$ProcessName'" |
        Where-Object { $_.CommandLine -like "*$CommandLineMatch*" } |
        ForEach-Object { Stop-ProcessOnce -TargetId $_.ProcessId -Reason "command line matched '$CommandLineMatch'" }
}

if ($Port) {
    Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique |
        ForEach-Object { Stop-ProcessOnce -TargetId $_ -Reason "listening on port $Port" }
}

if ($stoppedIds.Count -eq 0) {
    $target = if ($CommandLineMatch) { "'$CommandLineMatch'" } else { "n/a" }
    $portDesc = if ($Port) { "port $Port" } else { "no port given" }
    Write-Host "Nothing to stop (command line match: $target; $portDesc)."
}
