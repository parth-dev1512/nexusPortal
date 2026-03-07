const AdminLayout = {
  render: async (content) => {
    return `
      <div class="admin-layout" style="display: flex; min-height: 100vh;">
        <!-- Mobile Toggle Button -->
        <button class="admin-mobile-toggle" id="admin-sidebar-toggle">☰</button>
        
        <!-- Overlay (mobile only) -->
        <div class="admin-overlay" id="admin-overlay"></div>

        <!-- Sidebar -->
        <aside class="admin-sidebar" id="admin-sidebar">
          <div style="margin-bottom: 3rem; text-align: center;">
             <h2 style="font-family: var(--font-display); color: var(--color-primary); letter-spacing: -1px; font-size: 1.5rem;">NEXUS ADMIN</h2>
          </div>

          <nav style="display: flex; flex-direction: column; gap: 1rem;">
            <a href="/#/admin/dashboard" class="admin-link" style="color: #fff; text-decoration: none; padding: 0.8rem; border-radius: 4px; transition: 0.2s;">
              Dashboard
            </a>
            <a href="/#/admin/applications" class="admin-link" style="color: #fff; text-decoration: none; padding: 0.8rem; border-radius: 4px; transition: 0.2s;">
              Inbox (Applications)
            </a>
            <a href="/#/admin/schedule" class="admin-link" style="color: #fff; text-decoration: none; padding: 0.8rem; border-radius: 4px; transition: 0.2s;">
              Live Schedule
            </a>
          </nav>

          <div style="margin-top: auto;">
            <button id="admin-logout" class="btn" style="width: 100%; border-color: #333; color: #fff; background: transparent;">Log Out</button>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="admin-main">
          ${content}
        </main>
      </div>
    `;
  },
  afterRender: () => {
    // Highlight active link
    const hash = window.location.hash;
    document.querySelectorAll('.admin-link').forEach(link => {
      if (link.getAttribute('href') === hash) {
        link.style.background = 'var(--color-primary)';
        link.style.fontWeight = 'bold';
      }
    });

    document.getElementById('admin-logout')?.addEventListener('click', () => {
      localStorage.removeItem('nexus_admin_token');
      window.location.hash = '/admin/login';
    });

    // Mobile sidebar toggle
    const toggleBtn = document.getElementById('admin-sidebar-toggle');
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('admin-overlay');

    if (toggleBtn && sidebar && overlay) {
      const closeSidebar = () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
        toggleBtn.textContent = '☰';
      };

      toggleBtn.addEventListener('click', () => {
        const isOpen = sidebar.classList.contains('open');
        if (isOpen) {
          closeSidebar();
        } else {
          sidebar.classList.add('open');
          overlay.classList.add('open');
          toggleBtn.textContent = '✕';
        }
      });

      overlay.addEventListener('click', closeSidebar);

      // Close sidebar when a nav link is clicked on mobile
      sidebar.querySelectorAll('.admin-link').forEach(link => {
        link.addEventListener('click', closeSidebar);
      });
    }
  }
};

export default AdminLayout;
