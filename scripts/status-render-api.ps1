param([string]$ServiceName="astradio-api")
$Headers=@{Authorization="Bearer $($env:RENDER_API_KEY)"}
$svc=(Invoke-RestMethod -Headers $Headers -Uri "https://api.render.com/v1/services?limit=100") | Where-Object {$_.name -eq $ServiceName}
$deploys=Invoke-RestMethod -Headers $Headers -Uri "https://api.render.com/v1/services/$($svc.id)/deploys?limit=1"
$svc.serviceDetails.url
$deploys | Select-Object id,status,createdAt,updatedAt
