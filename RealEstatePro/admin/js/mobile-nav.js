document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu elements
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const topbar = document.querySelector('.topbar');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const mobileCloseBtn = document.querySelector('.mobile-close-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const sidebarMenu = document.querySelector('.sidebar-menu');
    
    // Toggle sidebar menu on mobile
    function toggleSidebar() {
        if (sidebar) sidebar.classList.toggle('active');
        if (topbar) topbar.classList.toggle('active');
        if (mobileNavOverlay) mobileNavOverlay.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    }
    
    // Close sidebar when clicking outside
    function closeSidebar(e) {
        if (sidebar && !sidebar.contains(e.target) && !e.target.closest('.mobile-menu-toggle')) {
            sidebar.classList.remove('active');
            if (topbar) topbar.classList.remove('active');
            if (mobileNavOverlay) mobileNavOverlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    }
    
    // Close mobile menu
    function closeMobileMenu() {
        if (mobileNav) mobileNav.classList.remove('active');
        if (mobileNavOverlay) mobileNavOverlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
    
    // Toggle sidebar menu
    function toggleSidebarMenu() {
        if (sidebarMenu) {
            const isHidden = sidebarMenu.style.display === 'none';
            sidebarMenu.style.display = isHidden ? 'block' : 'none';
        }
    }
    
    // Handle window resize
    function handleResize() {
        if (window.innerWidth >= 992) {
            if (sidebar) sidebar.classList.remove('active');
            if (topbar) topbar.classList.remove('active');
            if (mobileNavOverlay) mobileNavOverlay.classList.remove('active');
            if (mobileNav) mobileNav.classList.remove('active');
            if (sidebarMenu) sidebarMenu.style.display = '';
            document.body.classList.remove('no-scroll');
        } else {
            // On mobile, ensure sidebar menu is initially visible
            if (sidebarMenu) sidebarMenu.style.display = 'block';
        }
    }
    
    // Event listeners
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleSidebar);
    }
    
    if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener('click', toggleSidebar);
    }
    
    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', toggleSidebar);
    }
    
    document.addEventListener('click', closeSidebar);
    window.addEventListener('resize', handleResize);
    
    // Initialize
    handleResize();
    
    // Toggle submenu in mobile navigation
    function toggleSubmenu(e) {
        e.preventDefault();
        const submenu = this.nextElementSibling;
        const icon = this.querySelector('.submenu-icon');
        
        if (submenu && submenu.classList.contains('submenu')) {
            this.classList.toggle('active');
            submenu.classList.toggle('active');
            
            // Toggle icon rotation
            if (icon) {
                icon.style.transform = this.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0)';
            }
        } else {
            // If no submenu, close the mobile menu when clicking a link
            closeSidebar(e);
        }
    }
    
    // Handle submenu toggles in mobile navigation
    const submenuToggles = document.querySelectorAll('.submenu-toggle');
    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', toggleSubmenu);
    });
    
    // Close menu when clicking on a regular nav link (not a submenu toggle)
    const navLinks = document.querySelectorAll('.mobile-nav-list > li > a:not(.submenu-toggle)');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Toggle sidebar menu on mobile when clicking the sidebar header
    if (sidebar) {
        const sidebarHeader = sidebar.querySelector('.sidebar-header');
        if (sidebarHeader && window.innerWidth < 768) {
            sidebarHeader.style.cursor = 'pointer';
            sidebarHeader.addEventListener('click', toggleSidebarMenu);
        }
    }
    
    // Close menu when pressing Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (mobileNav && mobileNav.classList.contains('active')) {
                closeMobileMenu();
            }
            if (sidebar && sidebar.classList.contains('active')) {
                toggleSidebar();
            }
        }
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (mobileNav && mobileNav.classList.contains('active') && 
            !mobileNav.contains(e.target) && 
            mobileMenuToggle && !mobileMenuToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });
});
