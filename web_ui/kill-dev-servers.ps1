# Kill development servers on specific ports
Write-Host "Stopping development servers..." -ForegroundColor Yellow

# Our project ports
$ports = @(
    5500,  # Browser Sync
    3001,  # Browser Sync UI
    8000   # Python WebSocket server
)

$killedAny = $false

foreach ($port in $ports) {
    try {
        $connections = netstat -ano | Select-String ":$port\s" | Select-String "LISTENING"
        if ($connections) {
            $connections | ForEach-Object {
                $line = $_.Line
                if ($line -match '\s+(\d+)\s*$') {
                    $pid = $matches[1]
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "Killing process '$($process.ProcessName)' on port $port (PID: $pid)" -ForegroundColor Red
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                        $killedAny = $true
                    }
                }
            }
        }
    } catch {
        # Ignore errors
    }
}

if (-not $killedAny) {
    Write-Host "No development servers found running" -ForegroundColor Gray
}

Write-Host "Done!" -ForegroundColor Green


