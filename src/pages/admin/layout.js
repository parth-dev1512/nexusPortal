const AdminLayout = {
  render: async (content) => {
    return `
      <div class="admin-layout" style="display: flex; min-height: 100vh;">
        <!-- Sidebar -->
        <aside style="width: 250px; background: #000; color: #fff; display: flex; flex-direction: column; position: fixed; height: 100vh; padding: 2rem 1rem;">
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
        <main style="flex: 1; margin-left: 250px; padding: 3rem; background: var(--color-bg-deep);">
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
  }
};

export default AdminLayout;
