import { supabase } from '../lib/supabase.js';
import { showToast } from '../components/toast.js';

const Login = {
  render: async () => {
    return `
      <section class="container fade-in" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; padding: 2rem 0;">

        <div class="neo-box" style="width: 100%; max-width: 440px; background: #fff; padding: 0; overflow: hidden;">

          <!-- Tabs -->
          <div style="display: flex; border-bottom: 3px solid #000;">
            <button id="tab-login" class="auth-tab active-tab" style="flex: 1; padding: 1rem; font-family: var(--font-display); font-weight: 800; font-size: 1rem; text-transform: uppercase; border: none; cursor: pointer; background: var(--color-accent); color: #000; border-right: 2px solid #000; transition: 0.15s;">
              Sign In
            </button>
            <button id="tab-signup" class="auth-tab" style="flex: 1; padding: 1rem; font-family: var(--font-display); font-weight: 800; font-size: 1rem; text-transform: uppercase; border: none; cursor: pointer; background: #fff; color: #666; transition: 0.15s;">
              Create Account
            </button>
          </div>

          <div style="padding: 2.5rem;">


            <!-- Sign In Form -->

            <form id="login-form">
              <div style="margin-bottom: 1rem;">
                <label style="display: block; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; color: #333; margin-bottom: 0.4rem;">Ashoka Email</label>
                <input type="email" id="login-email" required placeholder="name.lastname@ashoka.edu.in"
                  style="width: 100%; padding: 0.85rem; border: 2px solid #000; font-size: 0.95rem; background: #fff; color: #000;">
              </div>
              <div style="margin-bottom: 1.5rem;">
                <label style="display: block; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; color: #333; margin-bottom: 0.4rem;">Password</label>
                <input type="password" id="login-password" required placeholder="••••••••"
                  style="width: 100%; padding: 0.85rem; border: 2px solid #000; font-size: 0.95rem; background: #fff; color: #000;">
              </div>
              <button type="submit" id="login-submit-btn" class="btn btn-primary" style="width: 100%; padding: 1rem;">Sign In</button>
            </form>

            <!-- Sign Up Form (hidden by default) -->
            <form id="signup-form" style="display: none;">
              <div style="margin-bottom: 1rem;">
                <label style="display: block; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; color: #333; margin-bottom: 0.4rem;">Full Name</label>
                <input type="text" id="signup-name" required placeholder="e.g. Aditi Sharma"
                  style="width: 100%; padding: 0.85rem; border: 2px solid #000; font-size: 0.95rem; background: #fff; color: #000;">
              </div>
              <div style="margin-bottom: 1rem;">
                <label style="display: block; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; color: #333; margin-bottom: 0.4rem;">Ashoka Email</label>
                <input type="email" id="signup-email" required placeholder="name.lastname@ashoka.edu.in"
                  style="width: 100%; padding: 0.85rem; border: 2px solid #000; font-size: 0.95rem; background: #fff; color: #000;">
              </div>
              <div style="margin-bottom: 1.5rem;">
                <label style="display: block; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; color: #333; margin-bottom: 0.4rem;">Password</label>
                <input type="password" id="signup-password" required placeholder="Min. 8 characters"
                  style="width: 100%; padding: 0.85rem; border: 2px solid #000; font-size: 0.95rem; background: #fff; color: #000;">
                <small style="color: #888; font-size: 0.78rem; margin-top: 0.3rem; display: block;">Must be an @ashoka.edu.in email address</small>
              </div>
              <button type="submit" id="signup-submit-btn" class="btn btn-primary" style="width: 100%; padding: 1rem;">Create Account</button>
            </form>

          </div>
        </div>

      </section>
    `;
  },

  afterRender: async () => {
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // Tab switching
    tabLogin.addEventListener('click', () => {
      loginForm.style.display = 'block';
      signupForm.style.display = 'none';
      tabLogin.style.background = 'var(--color-accent)';
      tabLogin.style.color = '#000';
      tabSignup.style.background = '#fff';
      tabSignup.style.color = '#666';
    });

    tabSignup.addEventListener('click', () => {
      signupForm.style.display = 'block';
      loginForm.style.display = 'none';
      tabSignup.style.background = 'var(--color-accent)';
      tabSignup.style.color = '#000';
      tabLogin.style.background = '#fff';
      tabLogin.style.color = '#666';
    });

    // Sign In
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const btn = document.getElementById('login-submit-btn');

      if (!email.endsWith('@ashoka.edu.in')) {
        showToast('Please use a valid @ashoka.edu.in email', 'error');
        return;
      }

      btn.innerText = 'Signing in...';
      btn.disabled = true;

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        showToast(error.message, 'error');
        btn.innerText = 'Sign In';
        btn.disabled = false;
        return;
      }

      // Store user info in localStorage for navbar/dashboard
      const user = data.user;
      const displayName = user.user_metadata?.full_name || email.split('@')[0].replace('.', ' ');
      localStorage.setItem('nexus_user', JSON.stringify({
        id: user.id,
        name: displayName,
        email: user.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=bd1e2d&color=fff`
      }));

      showToast('Welcome back!', 'success');
      setTimeout(() => {
        window.location.hash = '/dashboard';
        window.location.reload();
      }, 400);
    });

    // Sign Up
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const btn = document.getElementById('signup-submit-btn');

      if (!email.endsWith('@ashoka.edu.in')) {
        showToast('Please use a valid @ashoka.edu.in email', 'error');
        return;
      }
      if (password.length < 8) {
        showToast('Password must be at least 8 characters', 'error');
        return;
      }

      btn.innerText = 'Creating account...';
      btn.disabled = true;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }
        }
      });

      if (error) {
        showToast(error.message, 'error');
        btn.innerText = 'Create Account';
        btn.disabled = false;
        return;
      }

      // If email confirmation is disabled in Supabase, log them in directly
      if (data.session) {
        localStorage.setItem('nexus_user', JSON.stringify({
          id: data.user.id,
          name,
          email,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=bd1e2d&color=fff`
        }));
        showToast('Account created! Welcome to NEXUS.', 'success');
        setTimeout(() => {
          window.location.hash = '/dashboard';
          window.location.reload();
        }, 400);
      } else {
        // Email confirmation required
        showToast('Account created! Check your email to confirm.', 'success');
        btn.innerText = 'Check your email';
      }
    });
  }
};

export default Login;
