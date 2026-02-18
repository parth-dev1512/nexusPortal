import { getDashboardStats } from '../../lib/api.js';

const AdminDashboard = {
    render: async () => {
        let stats = { pendingApps: '-', activeCourses: '-' };
        try {
            stats = await getDashboardStats();
        } catch (e) {
            console.error('Failed to load stats', e);
        }

        return `
      <div>
        <header style="margin-bottom: 2rem;">
           <h1 style="color: #fff; font-size: 2.5rem;">Dashboard Overview</h1>
           <p style="color: #ccc;">Welcome back, Admin.</p>
        </header>
        
        <div class="grid-cols-2" style="gap: 2rem;">
            
            <a href="/#/admin/applications" style="text-decoration: none;">
                <div class="neo-box card" style="background: #fff; padding: 2rem; transition: transform 0.2s;">
                    <h3 style="margin-bottom: 0.5rem; color: #666; font-size: 1rem; text-transform: uppercase;">Pending Applications</h3>
                    <div style="font-size: 3.5rem; font-weight: 800; color: var(--color-primary); line-height: 1;">
                        ${stats.pendingApps}
                    </div>
                    <div style="margin-top: 1rem; font-size: 0.9rem; color: #000; font-weight: 600;">
                        Review Now &rarr;
                    </div>
                </div>
            </a>

            <a href="/#/admin/schedule" style="text-decoration: none;">
                <div class="neo-box card" style="background: #fff; padding: 2rem; transition: transform 0.2s;">
                    <h3 style="margin-bottom: 0.5rem; color: #666; font-size: 1rem; text-transform: uppercase;">Active Courses</h3>
                    <div style="font-size: 3.5rem; font-weight: 800; color: #000; line-height: 1;">
                        ${stats.activeCourses}
                    </div>
                </div>
            </a>

        </div>

        <div style="margin-top: 3rem; background: #2a2a2a; padding: 2rem; border: 1px solid #444; border-radius: 8px;">
            <h2 style="color: #fff; margin-bottom: 1rem;">System Status</h2>
            <div style="display: flex; gap: 2rem; color: #ccc;">
                <div>Backend: <span style="color: #4ade80;">Online (Supabase)</span></div>
                <div>Version: <span style="color: #fff;">v1.0.2</span></div>
            </div>
        </div>

      </div>
    `;
    },
    afterRender: async () => {
        // Dashboard real-time listeners can be added here if needed for other tables
    }
};

export default AdminDashboard;
