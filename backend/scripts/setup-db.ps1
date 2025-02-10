$password = "root"

# Drop and create database
Write-Host "Resetting database..."
$dropCreate = @"
DROP DATABASE IF EXISTS mempool;
CREATE DATABASE mempool;
"@
echo $dropCreate | mysql -u root "-p$password"

# Read SQL file content
Write-Host "Reading initialization script..."
$sqlContent = Get-Content -Path "scripts/final-mysql-setup.sql" -Raw

# Execute initialization script
Write-Host "Initializing database..."
echo $sqlContent | mysql -u root "-p$password" mempool

# Verify setup
Write-Host "`nVerifying setup..."
$verify = @"
USE mempool;
SHOW TABLES;
SELECT number FROM state WHERE name='schema_version';
"@
echo $verify | mysql -u root "-p$password"

Write-Host "`nSetup complete!"
