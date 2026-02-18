import { adminLogin } from '../../lib/api.js';
import { showToast } from '../../components/toast.js';

const AdminLogin = {
  render: async () => {
    return `
      <section class="container fade-in" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh;">
        
        <div class="neo-box" style="padding: 3rem; width: 100%; max-width: 420px; background: #fff;">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 2.5rem;">
            <div style="display: inline-block; background: var(--color-primary); color: #fff; font-family: var(--font-display); font-weight: 900; font-size: 1rem; padding: 0.4rem 1rem; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 1.25rem;">NEXUS ADMIN</div>
            <h1 style="font-size: 1.75rem; color: #000; margin-bottom: 0.5rem;">Sign In</h1>
            <p style="color: #666; font-size: 0.9rem;">Enter your admin credentials to continue.</p>
          </div>

          <form id="admin-login-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
            
            <div>
              <label for="admin-username" style="display: block; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; color: #333; margin-bottom: 0.5rem;">Username</label>
              <input 
                type="text" 
                id="admin-username" 
                placeholder="Enter username" 
                required 
                autocomplete="username"
                style="width: 100%; padding: 0.9rem 1rem; border: 2px solid #000; font-size: 1rem; background: #fff; color: #000;"
              >
            </div>

            <div>
              <label for="admin-password" style="display: block; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; color: #333; margin-bottom: 0.5rem;">Password</label>
              <input 
                type="password" 
                id="admin-password" 
                placeholder="Enter password" 
                required 
                autocomplete="current-password"
                style="width: 100%; padding: 0.9rem 1rem; border: 2px solid #000; font-size: 1rem; background: #fff; color: #000;"
              >
            </div>

            <button type="submit" id="login-submit-btn" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem; padding: 1rem; font-size: 1rem;">
              Sign In
            </button>
          </form>

          <button id="back-to-home" class="btn btn-secondary" style="margin-top: 1rem; width: 100%;">
            ← Back to Home
          </button>

          <p style="margin-top: 1.5rem; text-align: center; color: #aaa; font-size: 0.75rem;">
            Unauthorized access is strictly prohibited.
          </p>
        </div>

      </section>
    `;
  },
  afterRender: async () => {
    const form = document.getElementById('admin-login-form');
    const submitBtn = document.getElementById('login-submit-btn');

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('admin-username').value;
      const password = document.getElementById('admin-password').value;

      submitBtn.innerText = 'Signing in...';
      submitBtn.disabled = true;

      try {
        const result = await adminLogin(username, password);

        if (result.success) {
          localStorage.setItem('nexus_admin_token', 'true');
          localStorage.setItem('nexus_admin_user', username);
          showToast('Access Granted', 'success');
          window.location.hash = '/admin/dashboard';
        } else {
          showToast(result.message || 'Invalid credentials', 'error');
          document.getElementById('admin-password').value = '';
          submitBtn.innerText = 'Sign In';
          submitBtn.disabled = false;
        }
      } catch (err) {
        console.error(err);
        showToast('Login failed. Check your connection.', 'error');
        submitBtn.innerText = 'Sign In';
        submitBtn.disabled = false;
      }
    });

    const backBtn = document.getElementById('back-to-home');
    backBtn?.addEventListener('click', () => {
      window.location.hash = '/';
    });
  }
};

export default AdminLogin;
