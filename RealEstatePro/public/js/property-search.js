// Property Search Functionality
$(document).ready(function() {
    // Load builders dropdown on page load
    loadBuilders();
    
    // Handle residential search form submission
    $('#residential-search-form').on('submit', function(e) {
        e.preventDefault();
        performSearch('Residential');
    });
    
    // Handle commercial search form submission
    $('#commercial-search-form').on('submit', function(e) {
        e.preventDefault();
        performSearch('Commercial');
    });
    
    // Load builders for dropdown
    async function loadBuilders() {
        try {
            const response = await fetch('/api/projects/builders');
            const builders = await response.json();
            
            // Populate residential builder dropdown
            const resBuilderSelect = $('#res-builder');
            builders.forEach(builder => {
                resBuilderSelect.append(`<option value="${builder}">${builder}</option>`);
            });
            
            // Populate commercial builder dropdown
            const comBuilderSelect = $('#com-builder');
            builders.forEach(builder => {
                comBuilderSelect.append(`<option value="${builder}">${builder}</option>`);
            });
        } catch (error) {
            console.error('Error loading builders:', error);
        }
    }
    
    // Perform search
    async function performSearch(projectType) {
        let searchParams = {
            projectType: projectType
        };
        
        // Get search parameters based on form type
        if (projectType === 'Residential') {
            const location = $('#res-location').val();
            const bhk = $('#res-bhk').val();
            const builder = $('#res-builder').val();
            
            if (location) searchParams.location = location;
            if (bhk !== 'all') searchParams.bhk = bhk;
            if (builder !== 'all') searchParams.builder = builder;
        } else {
            const location = $('#com-location').val();
            const builder = $('#com-builder').val();
            
            if (location) searchParams.location = location;
            if (builder !== 'all') searchParams.builder = builder;
        }
        
        try {
            // Build query string
            const queryString = new URLSearchParams(searchParams).toString();
            const response = await fetch(`/api/projects/search?${queryString}`);
            const projects = await response.json();
            
            // Display results
            displaySearchResults(projects);
            
            // Scroll to results
            $('html, body').animate({
                scrollTop: $('#search-results-section').offset().top - 100
            }, 500);
            
        } catch (error) {
            console.error('Error searching projects:', error);
            showToaster('Error searching properties. Please try again.', 'error');
        }
    }
    
    // Display search results
    function displaySearchResults(projects) {
        const resultsSection = $('#search-results-section');
        const resultsContainer = $('#search-results');
        const resultsCount = $('#search-results-count');
        
        // Clear previous results
        resultsContainer.empty();
        
        if (projects.length === 0) {
            resultsSection.show();
            resultsCount.text('No properties found matching your criteria.');
            resultsContainer.html(`
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <i class="fas fa-search" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                    <p style="color: #666;">No properties found. Try adjusting your search criteria.</p>
                </div>
            `);
            return;
        }
        
        // Show results section
        resultsSection.show();
        resultsCount.text(`Found ${projects.length} ${projects.length === 1 ? 'property' : 'properties'}`);
        
        // Display each project
        projects.forEach(project => {
            const projectCard = `
                <div class="property-card" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: transform 0.2s;">
                    <div style="padding: 20px;">
                        <h3 style="color: #0d2c54; font-size: 1.2rem; margin-bottom: 10px;">${project.project_name}</h3>
                        <p style="color: #f7b801; font-weight: 600; margin-bottom: 15px;">
                            <i class="fas fa-building"></i> ${project.builder_name}
                        </p>
                        
                        <div style="display: grid; gap: 10px; margin-bottom: 15px;">
                            <div style="display: flex; align-items: center; color: #666;">
                                <i class="fas fa-map-marker-alt" style="width: 20px; color: #f7b801;"></i>
                                <span>${project.location}</span>
                            </div>
                            <div style="display: flex; align-items: center; color: #666;">
                                <i class="fas fa-bed" style="width: 20px; color: #f7b801;"></i>
                                <span>${project.bhk}</span>
                            </div>
                            <div style="display: flex; align-items: center; color: #666;">
                                <i class="fas fa-expand" style="width: 20px; color: #f7b801;"></i>
                                <span>${project.size_sqft} sq.ft</span>
                            </div>
                            <div style="display: flex; align-items: center; color: #666;">
                                <i class="fas fa-tag" style="width: 20px; color: #f7b801;"></i>
                                <span>${project.min_price} - ${project.max_price}</span>
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span class="badge" style="background: ${project.status_possession === 'Ready' ? '#10b981' : '#f59e0b'}; color: white; padding: 4px 12px; border-radius: 4px; font-size: 0.875rem;">
                                ${project.status_possession}
                            </span>
                            <button class="btn btn-primary btn-sm" onclick="enquireProject('${project.project_name}', '${project.builder_name}')" style="padding: 8px 16px; font-size: 0.9rem;">
                                Enquire Now
                            </button>
                        </div>
                    </div>
                </div>
            `;
            resultsContainer.append(projectCard);
        });
        
        // Add hover effect
        $('.property-card').hover(
            function() { $(this).css('transform', 'translateY(-4px)'); },
            function() { $(this).css('transform', 'translateY(0)'); }
        );
    }
});

// Function to handle project enquiry
function enquireProject(projectName, builderName) {
    // Pre-fill the enquiry form with project details
    const form = $('#popup-inquiry-form');
    
    // Add project info to the form
    if (!form.find('input[name="project_name"]').length) {
        form.append(`<input type="hidden" name="project_name" value="${projectName}">`);
        form.append(`<input type="hidden" name="builder_name" value="${builderName}">`);
    } else {
        form.find('input[name="project_name"]').val(projectName);
        form.find('input[name="builder_name"]').val(builderName);
    }
    
    // Update source
    form.find('input[name="source"]').val(`Property Search - ${projectName}`);
    
    // Open the enquiry popup
    $('#quick-enquiry-popup').show();
    $('body').css('overflow', 'hidden');
}
