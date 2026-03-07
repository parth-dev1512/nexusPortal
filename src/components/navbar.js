import { supabase } from '../lib/supabase.js';

const Navbar = {
  render: async () => {
    return `
      <nav>
        <div class="container nav-content">
          <div style="display: flex; align-items: stretch; gap: 0.75rem;">
            <a href="/#" class="logo">NEXUS</a>
            <a href="/#/admin/login" class="admin-badge" title="Admin Panel">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </a>
          </div>
          <button class="hamburger-btn" id="hamburger-btn" aria-label="Menu">☰</button>
          <div class="nav-links" id="nav-links">
            <a href="/#/">Schedule</a>
            <a href="/#/search">Find Course</a>
            <a href="/#/register" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Start Teaching</a>
            <div id="auth-links" class="nav-auth-links">
              <a href="/#/login">Log In</a>
            </div>
          </div>
        </div>
      </nav>
    `;
  },
  afterRender: async () => {
    // Hamburger toggle
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('nav-links');
    if (hamburgerBtn && navLinks) {
      hamburgerBtn.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        hamburgerBtn.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
      });

      // Close menu when a link is tapped
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('open');
          hamburgerBtn.textContent = '☰';
        });
      });
    }

    try {
      const container = document.getElementById('auth-links');
      if (!container) return;

      // Restore session from Supabase if localStorage is stale
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (session) {
        // Sync localStorage with real session
        const user = session.user;
        const stored = JSON.parse(localStorage.getItem('nexus_user'));
        if (!stored) {
          const displayName = user.user_metadata?.full_name || user.email.split('@')[0].replace('.', ' ');
          localStorage.setItem('nexus_user', JSON.stringify({
            id: user.id,
            name: displayName,
            email: user.email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=bd1e2d&color=fff`
          }));
        }
        const nexusUser = JSON.parse(localStorage.getItem('nexus_user'));
        container.innerHTML = `
          <a href="/#/dashboard" style="display: flex; align-items: center; gap: 0.5rem;">
            <img src="${nexusUser.avatar}" style="width: 28px; height: 28px; border-radius: 50%; border: 2px solid #000; object-fit: cover;">
            <span style="font-size: 0.9rem;">My Dashboard</span>
          </a>
        `;
      } else {
        // No session — clear stale localStorage
        localStorage.removeItem('nexus_user');
        container.innerHTML = `<a href="/#/login">Log In</a>`;
      }
    } catch (err) {
      console.warn('Navbar auth sync failed:', err);
      // Fallback to "Log In" if sync fails (e.g. offline/Supabase down)
      const container = document.getElementById('auth-links');
      if (container) container.innerHTML = `<a href="/#/login">Log In</a>`;
    }
  },
};

export default Navbar;
