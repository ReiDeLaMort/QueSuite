$ErrorActionPreference = 'Stop'
& "$PSScriptRoot/scripts/Invoke-Pnpm.ps1" install --frozen-lockfile
& "$PSScriptRoot/scripts/Invoke-Pnpm.ps1" db:migrate:local
& "$PSScriptRoot/scripts/Invoke-Pnpm.ps1" dev
