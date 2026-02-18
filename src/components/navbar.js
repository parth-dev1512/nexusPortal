import { supabase } from '../lib/supabase.js';

const Navbar = {
  render: async () => {
    return `
      <nav>
        <div class="container nav-content">
          <a href="/#/admin/login" style="text-decoration: none; font-size: 9px; font-weight: 900; background: #000; color: #fdb913; border-right: 2px solid #000; border-bottom: 2px solid #000; padding: 3px 8px; position: absolute; top: 0; left: 0; z-index: 1000; letter-spacing: 1px;">ADMIN</a>
          <a href="/#" class="logo">NEXUS</a>
          <div class="nav-links">
            <a href="/#/">Schedule</a>
            <a href="/#/search">Find Course</a>
            <a href="/#/register" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Start Teaching</a>
            <div id="auth-links">
              <a href="/#/login">Log In</a>
            </div>
          </div>
        </div>
      </nav>
    `;
  },
  afterRender: async () => {
    const container = document.getElementById('auth-links');
    if (!container) return;

    // Restore session from Supabase if localStorage is stale
    const { data: { session } } = await supabase.auth.getSession();

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
  },
};

export default Navbar;
