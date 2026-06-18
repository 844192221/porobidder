param(
    [string]$SshHost = "165.232.49.180",
    [string]$SshUser = "root",
    [string]$Branch = "frontend-ui",
    [string]$RemoteDir = "/opt/porobidder",
    [switch]$SkipPush
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

if (-not $SkipPush) {
    Write-Host "==> git push PoroBidder $Branch"
    git push PoroBidder $Branch
}

$remote = "${SshUser}@${SshHost}"
Write-Host "==> Deploy on VPS ($remote): git pull, docker build, restart"
ssh $remote "cd ${RemoteDir} && DEPLOY_BRANCH=${Branch} bash scripts/deploy-vps.sh"
