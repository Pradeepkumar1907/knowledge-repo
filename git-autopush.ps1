# git-autopush.ps1
# Automates Git commits and pushes when files change in the current directory.

$Watcher = New-Object System.IO.FileSystemWatcher
$Watcher.Path = $PSScriptRoot
$Watcher.IncludeSubdirectories = $true
$Watcher.EnableRaisingEvents = $true

# Filter out common noisy directories
$FilterPatterns = @("\.git\", "node_modules\", "dist\", "build\", "\.DS_Store")

Write-Host "🚀 Git Auto-Push started in: $PSScriptRoot" -ForegroundColor Cyan
Write-Host "Watching for changes... (Press Ctrl+C to stop)" -ForegroundColor Yellow

# Debounce timer to group multiple rapid saves
$LastTriggered = Get-Date
$DebounceSeconds = 5

$Action = {
    $Path = $Event.SourceEventArgs.FullPath
    $CurrentTime = Get-Date
    
    # Ignore specific patterns
    foreach ($Pattern in $FilterPatterns) {
        if ($Path -like "*$Pattern*") { return }
    }

    # Debounce check
    if (($CurrentTime - $global:LastTriggered).TotalSeconds -lt $DebounceSeconds) {
        return
    }
    
    $global:LastTriggered = $CurrentTime
    Write-Host "`n📝 Change detected: $(Split-Path $Path -Leaf)" -ForegroundColor Magenta
    
    # Check if there are actual changes for Git
    $Status = git status --porcelain
    if (-not $Status) {
        Write-Host "No changes to commit." -ForegroundColor Gray
        return
    }

    Write-Host "Adding and committing..." -ForegroundColor Gray
    git add .
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Auto-push: $Timestamp"
    
    Write-Host "Pushing to origin main..." -ForegroundColor Cyan
    git push origin main
    
    Write-Host "✅ Done! Waiting for next change..." -ForegroundColor Green
}

# Register events
$Handlers = @()
$Handlers += Register-ObjectEvent $Watcher "Changed" -Action $Action
$Handlers += Register-ObjectEvent $Watcher "Created" -Action $Action
$Handlers += Register-ObjectEvent $Watcher "Deleted" -Action $Action
$Handlers += Register-ObjectEvent $Watcher "Renamed" -Action $Action

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    # Cleanup handlers on exit
    Write-Host "`n🛑 Stopping Auto-Push..." -ForegroundColor Red
    foreach ($Handler in $Handlers) {
        Unregister-Event -SourceIdentifier $Handler.Name
    }
}
