param(
    [string]$SshHost = "165.232.49.180",
    [string]$SshUser = "root",
    [switch]$SkipPush
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

if (-not $SkipPush) {
    Write-Host "==> git push"
    git push
}

$remote = "${SshUser}@${SshHost}"
Write-Host "==> Deploy on VPS ($remote)"
ssh $remote "cd /opt/porobidder && bash scripts/deploy-vps.sh"
