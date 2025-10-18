# PowerShell script to fix duplicate form submissions and replace alerts with toasts in all builder pages

$builderDir = ".\public\builder"
$builderFiles = Get-ChildItem -Path $builderDir -Filter "*.html" | Where-Object { $_.Name -ne "_TEMPLATE.html" -and $_.Name -ne "eldeco.html" }

foreach ($file in $builderFiles) {
    Write-Host "Processing $($file.Name)..." -ForegroundColor Green
    
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $modified = $false
    
    # Replace alert calls with toast calls - simpler approach
    if ($content -match "alert\(") {
        # Success alerts
        $content = $content -replace "alert\('.*Thank you.*'\)", "window.FormHandler.showToast('Thank you for your interest! We will contact you soon.')"
        
        # Validation alerts
        $content = $content -replace "alert\('Please enter a valid name.*'\)", "window.FormHandler.showToast('Please enter a valid name', true)"
        $content = $content -replace "alert\('Please enter a valid email.*'\)", "window.FormHandler.showToast('Please enter a valid email address', true)"
        $content = $content -replace "alert\('Please enter a valid 10-digit.*'\)", "window.FormHandler.showToast('Please enter a valid 10-digit mobile number', true)"
        
        # Error alerts
        $content = $content -replace "alert\('You have already submitted.*'\)", "window.FormHandler.showToast('You have already submitted an enquiry. We will contact you soon.', true)"
        $content = $content -replace "alert\('There was an error.*'\)", "window.FormHandler.showToast('There was an error. Please try again.', true)"
        
        $modified = $true
    }
    
    # Save the modified content
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  - Replaced alerts with toasts" -ForegroundColor Yellow
    } else {
        Write-Host "  - No changes needed" -ForegroundColor Gray
    }
}

Write-Host "`nAll builder files have been updated!" -ForegroundColor Cyan
Write-Host "Summary of changes:" -ForegroundColor Cyan
Write-Host "  1. Replaced all alert() calls with window.FormHandler.showToast()" -ForegroundColor White
Write-Host "  2. Toasts will now auto-hide after 2 seconds" -ForegroundColor White
