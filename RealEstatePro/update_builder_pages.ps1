# PowerShell script to update all builder pages with popup enquiry functionality

$builderPages = @(
    "ace.html",
    "ats.html", 
    "bhutani.html",
    "crc.html",
    "eldeco.html",
    "exotica.html",
    "experion.html",
    "fairfox.html",
    "godrej.html",
    "group108.html",
    "gulshan.html",
    "homecraft.html",
    "kalptaru.html",
    "l&t.html",
    "max.html",
    "prestige.html",
    "steller.html",
    "tata.html"
)

$builderDir = "c:\Users\Techfino User\OneDrive\Desktop\RealEstatePro\RealEstatePro\RealEstatePro\public\builder"

foreach ($page in $builderPages) {
    $filePath = Join-Path $builderDir $page
    
    if (Test-Path $filePath) {
        Write-Host "Updating $page..."
        
        # Read the file content
        $content = Get-Content $filePath -Raw
        
        # Skip if already updated (check for openEnquiryPopup)
        if ($content -match "openEnquiryPopup") {
            Write-Host "$page already updated, skipping..."
            continue
        }
        
        # Update the Enquire Now button
        $content = $content -replace 'onclick="scrollToEnquiry\(\)"', 'onclick="openEnquiryPopup()"'
        
        # Hide the enquiry form section by default
        $content = $content -replace '<!-- Enquiry Form Section -->\s*<section class="enquiry-form-section" id="enquiry-section">', '<!-- Enquiry Form Section (Hidden by default) --><section class="enquiry-form-section" id="enquiry-section" style="display: none;">'
        
        # Update contactUs function
        $content = $content -replace 'function contactUs\(\) \{\s*scrollToEnquiry\(\);\s*\}', 'function contactUs() { openEnquiryPopup(); }'
        
        # Add openEnquiryPopup function before contactUs
        $content = $content -replace '(function scrollToEnquiry\(\) \{[^}]+\}\s*)', '$1`nfunction openEnquiryPopup() {`n  $(''#main-enquiry-popup'').attr(''aria-hidden'', ''false'').show();`n  $(''body'').css(''overflow'', ''hidden'');`n}`n'
        
        # Write the updated content back
        Set-Content $filePath $content -Encoding UTF8
        
        Write-Host "$page updated successfully!"
    } else {
        Write-Host "File not found: $page"
    }
}

Write-Host "All builder pages have been processed!"
