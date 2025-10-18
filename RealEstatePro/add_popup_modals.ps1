# PowerShell script to add popup modals and JavaScript handlers to all builder pages

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

# Function to get builder name from file content
function Get-BuilderName($content) {
    if ($content -match 'name="builder_name" value="([^"]+)"') {
        return $matches[1]
    }
    return "Builder"
}

foreach ($page in $builderPages) {
    $filePath = Join-Path $builderDir $page
    
    if (Test-Path $filePath) {
        Write-Host "Adding popup modal to $page..."
        
        # Read the file content
        $content = Get-Content $filePath -Raw
        
        # Skip if already has main-enquiry-popup
        if ($content -match "main-enquiry-popup") {
            Write-Host "$page already has popup modal, skipping..."
            continue
        }
        
        # Get builder name
        $builderName = Get-BuilderName $content
        
        # Define the popup modal HTML
        $popupModal = @"

  <!-- Main Enquiry Form Popup -->
  <div id="main-enquiry-popup" class="enquiry-popup" role="dialog" aria-modal="true" aria-hidden="true">
    <div class="popup-content" style="max-width: 600px;">
      <button id="close-main-popup-btn" class="close-popup" aria-label="Close popup">&times;</button>
      <h3 style="color: #0d2c54; font-size: 1.8rem; margin-bottom: 20px; text-align: center;">Enquire About $builderName Projects</h3>
      <p style="color: #6b7280; text-align: center; margin-bottom: 25px;">Fill the form below for exclusive details and best offers</p>
      <form id="main-popup-enquiry-form" aria-label="Main enquiry form">
        <input type="hidden" name="builder_name" value="$builderName">
        
        <div class="form-group">
          <label for="popup-name" style="color: #0d2c54; font-weight: 600; margin-bottom: 8px; display: block;">Full Name *</label>
          <input type="text" id="popup-name" name="name" required placeholder="Enter your full name" style="width: 100%; padding: 12px 15px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem;">
        </div>
        
        <div class="form-group">
          <label for="popup-email" style="color: #0d2c54; font-weight: 600; margin-bottom: 8px; display: block;">Email Address *</label>
          <input type="email" id="popup-email" name="email" required placeholder="Enter your email address" style="width: 100%; padding: 12px 15px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem;">
        </div>
        
        <div class="form-group">
          <label for="popup-phone" style="color: #0d2c54; font-weight: 600; margin-bottom: 8px; display: block;">Phone Number *</label>
          <input type="tel" id="popup-phone" name="phone" required pattern="[0-9]{10}" maxlength="10" placeholder="Enter your 10-digit phone number" style="width: 100%; padding: 12px 15px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem;">
        </div>
        
        <div class="form-group">
          <label for="popup-message" style="color: #0d2c54; font-weight: 600; margin-bottom: 8px; display: block;">Message</label>
          <textarea id="popup-message" name="message" placeholder="Tell us about your requirements (optional)" style="width: 100%; padding: 12px 15px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; min-height: 100px; resize: vertical;"></textarea>
        </div>
        
        <button type="submit" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #f7b801 0%, #e0a600 100%); color: #fff; border: none; border-radius: 8px; font-weight: 700; font-size: 1.1rem; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 12px rgba(247, 184, 1, 0.3);">
          <i class="fas fa-paper-plane"></i> Submit Enquiry
        </button>
      </form>
    </div>
  </div>
"@

        # Add popup modal before the toaster div
        $content = $content -replace '(\s*<div id="toaster")', "$popupModal`$1"
        
        # Add JavaScript handlers before the closing of document ready
        $jsHandlers = @"

      // Main enquiry popup form submission
      `$('#main-popup-enquiry-form').on('submit', function(e) {
        e.preventDefault();
        
        const formData = {
          builder_name: `$(this).find('input[name="builder_name"]').val(),
          name: `$('#popup-name').val().trim(),
          email: `$('#popup-email').val().trim(),
          phone: `$('#popup-phone').val().trim(),
          message: `$('#popup-message').val().trim() || 'General inquiry about projects'
        };
        
        // Validation
        if (!formData.name || formData.name.length < 2) {
          alert('Please enter a valid name (minimum 2 characters)');
          return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+`$/;
        if (!emailRegex.test(formData.email)) {
          alert('Please enter a valid email address');
          return;
        }
        
        const phoneRegex = /^[6-9][0-9]{9}`$/;
        if (!phoneRegex.test(formData.phone)) {
          alert('Please enter a valid 10-digit mobile number');
          return;
        }

        `$.ajax({
          url: '/api/builder-inquiry',
          method: 'POST',
          data: JSON.stringify(formData),
          contentType: 'application/json',
          success: function(response) {
            alert('✓ Thank you for your interest! We will contact you soon.');
            `$('#main-popup-enquiry-form')[0].reset();
            `$('#main-enquiry-popup').attr('aria-hidden', 'true').hide();
            `$('body').css('overflow', '');
          },
          error: function(xhr, status, error) {
            if (xhr.status === 409) {
              alert('You have already submitted an enquiry. We will contact you soon.');
            } else {
              alert('There was an error submitting your enquiry. Please try again.');
            }
          }
        });
      });

      // Popup event handlers
      `$('#floating-enquiry-btn').on('click', function() {
        `$('#quick-enquiry-popup').attr('aria-hidden', 'false').show();
        `$('body').css('overflow', 'hidden');
      });

      `$('#close-popup-btn').on('click', function() {
        `$('#quick-enquiry-popup').attr('aria-hidden', 'true').hide();
        `$('body').css('overflow', '');
      });

      `$('#close-main-popup-btn').on('click', function() {
        `$('#main-enquiry-popup').attr('aria-hidden', 'true').hide();
        `$('body').css('overflow', '');
      });

      // Close popup when clicking outside
      `$('.enquiry-popup').on('click', function(e) {
        if (e.target === this) {
          `$(this).attr('aria-hidden', 'true').hide();
          `$('body').css('overflow', '');
        }
      });
"@

        # Add JavaScript handlers before the closing of document ready
        $content = $content -replace '(\s*\}\);\s*function scrollToEnquiry)', "$jsHandlers`$1"
        
        # Write the updated content back
        Set-Content $filePath $content -Encoding UTF8
        
        Write-Host "$page popup modal added successfully!"
    } else {
        Write-Host "File not found: $page"
    }
}

Write-Host "All builder pages have been updated with popup modals!"
