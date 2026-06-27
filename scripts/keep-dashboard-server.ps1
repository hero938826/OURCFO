$ErrorActionPreference = "SilentlyContinue"

$root = Split-Path -Parent $PSScriptRoot
$node = "C:\Users\wooer\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$server = Join-Path $root "scripts\dev-server.cjs"
$outLog = Join-Path $root ".dev-server.out.log"
$errLog = Join-Path $root ".dev-server.err.log"
$watchLog = Join-Path $root ".dev-server-watch.log"
$port = 4173
$mutexCreated = $false
$mutex = [System.Threading.Mutex]::new($true, "Global\HomeWealthDashboardWatchdog", [ref]$mutexCreated)

if (-not $mutexCreated) {
  exit
}

function Write-WatchLog($message) {
  $stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Add-Content -Path $watchLog -Value "[$stamp] $message"
}

function Test-DashboardPort {
  try {
    $client = [System.Net.Sockets.TcpClient]::new()
    $result = $client.BeginConnect("127.0.0.1", $port, $null, $null)
    $connected = $result.AsyncWaitHandle.WaitOne(700, $false)
    if ($connected) { $client.EndConnect($result) }
    $client.Close()
    return $connected
  } catch {
    return $false
  }
}

function Start-DashboardServer {
  $psi = [System.Diagnostics.ProcessStartInfo]::new()
  $psi.FileName = $node
  $psi.Arguments = "`"$server`""
  $psi.WorkingDirectory = $root
  $psi.UseShellExecute = $false
  $psi.CreateNoWindow = $true
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $process = [System.Diagnostics.Process]::Start($psi)

  Register-ObjectEvent -InputObject $process -EventName OutputDataReceived -Action {
    if ($EventArgs.Data) { Add-Content -Path $Event.MessageData.OutLog -Value $EventArgs.Data }
  } -MessageData @{ OutLog = $outLog } | Out-Null
  Register-ObjectEvent -InputObject $process -EventName ErrorDataReceived -Action {
    if ($EventArgs.Data) { Add-Content -Path $Event.MessageData.ErrLog -Value $EventArgs.Data }
  } -MessageData @{ ErrLog = $errLog } | Out-Null

  $process.BeginOutputReadLine()
  $process.BeginErrorReadLine()
  Write-WatchLog "Started dashboard server PID $($process.Id)."
}

Write-WatchLog "Dashboard watchdog started."

try {
  while ($true) {
    if (-not (Test-DashboardPort)) {
      Start-DashboardServer
      Start-Sleep -Seconds 3
    }
    Start-Sleep -Seconds 15
  }
} finally {
  $mutex.ReleaseMutex() | Out-Null
  $mutex.Dispose()
}
