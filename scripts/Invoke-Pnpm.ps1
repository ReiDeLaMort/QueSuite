$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
Push-Location -LiteralPath $projectRoot
try {
 $installedPnpm = Get-Command pnpm.cmd,pnpm -ErrorAction SilentlyContinue | Select-Object -First 1
 if ($installedPnpm) { & $installedPnpm.Source @args }
 else {
  $runtimeRoot = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node'
  $nodeBinary = Join-Path $runtimeRoot 'bin/node.exe'
  $pnpmScript = Join-Path $runtimeRoot 'node_modules/pnpm/bin/pnpm.cjs'
  if (!(Test-Path -LiteralPath $nodeBinary) -or !(Test-Path -LiteralPath $pnpmScript)) { throw 'Install Node.js 24 and pnpm 11.19.0, then run pnpm from this project folder.' }
  $env:PATH = (Split-Path $nodeBinary -Parent) + [IO.Path]::PathSeparator + $env:PATH
  & $nodeBinary $pnpmScript @args
 }
 if ($LASTEXITCODE -ne 0) { throw "pnpm exited with code $LASTEXITCODE" }
} finally { Pop-Location }
