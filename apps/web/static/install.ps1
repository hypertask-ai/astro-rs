& {
  $ErrorActionPreference = 'Stop'
  $ProgressPreference = 'SilentlyContinue'
  $repository = if ($env:HYPERTASK_CLI_RELEASE_ROOT) { $env:HYPERTASK_CLI_RELEASE_ROOT } else { 'https://github.com/hypertask-ai/cli/releases' }
  $version = if ($env:HYPERTASK_CLI_VERSION) { $env:HYPERTASK_CLI_VERSION } else { 'latest' }
  $installDir = if ($env:HYPERTASK_INSTALL_DIR) { $env:HYPERTASK_INSTALL_DIR } else { Join-Path $env:LOCALAPPDATA 'Programs\Hypertask' }

  if (-not [Environment]::Is64BitOperatingSystem) {
    throw 'Hypertask CLI needs 64-bit Windows.'
  }

  [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

  $asset = 'hypertask-windows-x86_64.exe'
  if ($version -eq 'latest') {
    $downloadBase = "$repository/latest/download"
  } else {
    $tag = if ($version.StartsWith('v')) { $version } else { "v$version" }
    $downloadBase = "$repository/download/$tag"
  }

  $workDir = Join-Path ([IO.Path]::GetTempPath()) ([IO.Path]::GetRandomFileName())
  New-Item -ItemType Directory -Path $workDir | Out-Null
  try {
    $downloaded = Join-Path $workDir $asset
    Invoke-WebRequest -UseBasicParsing -Uri "$downloadBase/$asset" -OutFile $downloaded
    $checksums = (Invoke-WebRequest -UseBasicParsing -Uri "$downloadBase/checksums.txt").Content
    if ($checksums -is [byte[]]) { $checksums = [Text.Encoding]::UTF8.GetString($checksums) }

    $expected = $null
    foreach ($line in $checksums -split "`n") {
      $fields = $line.Trim() -split '\s+'
      if ($fields.Count -ge 2 -and $fields[1] -eq $asset) { $expected = $fields[0] }
    }
    if (-not $expected) { throw "No checksum found for $asset." }

    $actual = (Get-FileHash -Algorithm SHA256 -Path $downloaded).Hash
    if ($actual -ne $expected.ToUpperInvariant()) { throw "Checksum verification failed for $asset." }

    New-Item -ItemType Directory -Force -Path $installDir | Out-Null
    $destination = Join-Path $installDir 'hypertask.exe'
    Move-Item -Force -Path $downloaded -Destination $destination
  } finally {
    Remove-Item -Recurse -Force -Path $workDir -ErrorAction SilentlyContinue
  }

  if ([Environment]::OSVersion.Platform -eq 'Win32NT') {
    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    $entries = if ($userPath) { $userPath -split ';' } else { @() }
    if ($entries -notcontains $installDir) {
      [Environment]::SetEnvironmentVariable('Path', (($entries + $installDir) | Where-Object { $_ }) -join ';', 'User')
      $env:Path = "$env:Path;$installDir"
      Write-Host "Added $installDir to your PATH. Open a new terminal to use hypertask everywhere."
    }
  }

  Write-Host "Installed Hypertask CLI at $destination"
}
