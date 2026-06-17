param(
    [string]$SshHost = "165.232.49.180",
    [string]$SshUser = "root",
    [string]$Branch = "frontend-ui",
    [string]$RemoteDir = "/opt/porobidder",
    [switch]$SkipPush,
    [switch]$SkipFrontendBuild
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

if (-not $SkipPush) {
    Write-Host "==> git push PoroBidder $Branch"
    git push PoroBidder $Branch
}

$remote = "${SshUser}@${SshHost}"
Write-Host "==> Checkout ${Branch} on VPS"
ssh $remote "cd ${RemoteDir} && git fetch origin && git checkout ${Branch} && git pull origin ${Branch}"

if (-not $SkipFrontendBuild) {
    Write-Host "==> Build frontend locally"
    Push-Location frontend
    npm run build
    Pop-Location
}

if (-not (Test-Path "frontend/dist/index.html")) {
    throw "frontend/dist/index.html not found. Run npm run build in frontend/ first."
}

$remote = "${SshUser}@${SshHost}"
Write-Host "==> Sync frontend dist to VPS"
ssh $remote "mkdir -p ${RemoteDir}/frontend/dist"
scp -r frontend/dist/* "${remote}:${RemoteDir}/frontend/dist/"
ssh $remote "chmod -R a+rX ${RemoteDir}/frontend/dist"

Write-Host "==> Deploy on VPS ($remote)"
ssh $remote "cd ${RemoteDir} && DEPLOY_BRANCH=${Branch} bash scripts/deploy-vps.sh"
