$body = @{
    username = 'admin'
    password = 'admin'
} | ConvertTo-Json

Write-Host "Sending request with body:"
Write-Host $body

$response = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method Post -ContentType 'application/json' -Body $body

Write-Host "`nResponse:"
$response | ConvertTo-Json
