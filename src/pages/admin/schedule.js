import { getCourses, endCourse, deleteCourse, getEndedCourses } from '../../lib/api.js';
import { showToast } from '../../components/toast.js';

const AdminSchedule = {
    render: async () => {
        let activeCourses = [];
        let pastCourses = [];
        try {
            activeCourses = await getCourses('approved');
            pastCourses = await getEndedCourses();
        } catch (e) {
            console.error(e);
        }

        const activeRows = activeCourses.map(c => {
            const sessions = c.sessions || [];
            const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
            const range = sorted.length > 0
                ? `${new Date(sorted[0].date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — ${new Date(sorted[sorted.length - 1].date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                : 'No sessions';

            return `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 1rem;">
                        <div style="font-weight: 700;">${c.title}</div>
                        <div style="color: #666; font-size: 0.9rem;">${c.instructor}</div>
                    </td>
                    <td style="padding: 1rem;">
                        <div style="font-weight: 600;">${range}</div>
                        <div style="font-size: 0.8rem; color: #888;">${sessions.length} sessions total</div>
                    </td>
                    <td style="padding: 1rem;">
                        ${c.location || 'N/A'}
                    </td>
                    <td style="padding: 1rem; text-align: right; display: flex; gap: 0.5rem; justify-content: flex-end;">
                        <button class="btn-end btn btn-secondary" data-id="${c.id}" style="
                            font-size: 0.8rem; 
                            padding: 0.4rem 0.8rem;
                        ">End Course</button>
                        <button class="btn-delete btn" data-id="${c.id}" style="
                            background: #fee2e2; 
                            color: #bd1e2d; 
                            border: 1px solid #bd1e2d; 
                            font-size: 0.8rem; 
                            padding: 0.4rem 0.8rem;
                        ">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');

        const pastRows = pastCourses.map(c => `
            <tr style="border-bottom: 1px solid #eee; background: #f9fafb;">
                <td style="padding: 1rem;">
                    <div style="font-weight: 700; color: #666;">${c.title}</div>
                    <div style="color: #999; font-size: 0.8rem;">${c.instructor}</div>
                </td>
                <td style="padding: 1rem; color: #999; font-size: 0.9rem;">
                    Ended
                </td>
                <td style="padding: 1rem; color: #999; font-size: 0.9rem;">
                    -
                </td>
                <td style="padding: 1rem; text-align: right;">
                    <button class="btn-delete btn" data-id="${c.id}" style="
                        background: #fee2e2; 
                        color: #bd1e2d; 
                        border: 1px solid #bd1e2d; 
                        font-size: 0.8rem; 
                        padding: 0.4rem 0.8rem;
                    ">Delete</button>
                </td>
            </tr>
        `).join('');

        return `
            <div class="fade-in">
                 <header style="margin-bottom: 2rem;">
                    <h1 style="color: #fff; margin-bottom: 0.5rem;">Manage Schedule</h1>
                    <p style="color: #ccc;">Oversee live and past courses.</p>
                </header>

                <h2 style="color: #fff; font-size: 1.5rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span style="width: 12px; height: 12px; background: #4ade80; border-radius: 50%;"></span>
                    Live Courses
                </h2>
                <div class="card neo-box" style="background: #fff; padding: 0; overflow: hidden; margin-bottom: 3rem;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: #f8fafc; border-bottom: 2px solid #000;">
                            <tr>
                                <th style="padding: 1rem; text-align: left; font-weight: 700; width: 40%;">Course</th>
                                <th style="padding: 1rem; text-align: left; font-weight: 700;">Schedule</th>
                                <th style="padding: 1rem; text-align: left; font-weight: 700;">Location</th>
                                <th style="padding: 1rem; text-align: right; font-weight: 700;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${activeCourses.length > 0 ? activeRows : `<tr><td colspan="4" style="padding: 2rem; text-align: center; color: #888;">No active courses.</td></tr>`}
                        </tbody>
                    </table>
                </div>

                <h2 style="color: #fff; font-size: 1.5rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span style="width: 12px; height: 12px; background: #94a3b8; border-radius: 50%;"></span>
                    Past Courses
                </h2>
                <div class="card neo-box" style="background: #fff; padding: 0; overflow: hidden; opacity: 0.9;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: #f1f5f9; border-bottom: 2px solid #ccc;">
                            <tr>
                                <th style="padding: 1rem; text-align: left; font-weight: 700; width: 40%; color: #64748b;">Course</th>
                                <th style="padding: 1rem; text-align: left; font-weight: 700; color: #64748b;">Status</th>
                                <th style="padding: 1rem; text-align: left; font-weight: 700; color: #64748b;">Schedule</th>
                                <th style="padding: 1rem; text-align: right; font-weight: 700; color: #64748b;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pastCourses.length > 0 ? pastRows : `<tr><td colspan="4" style="padding: 2rem; text-align: center; color: #888;">No past courses in registry.</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },
    afterRender: async () => {
        // End Course Logic
        document.querySelectorAll('.btn-end').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Are you sure you want to end this course? It will be moved to past courses and hidden from the public schedule.')) return;

                const id = btn.dataset.id;
                try {
                    btn.innerText = 'Ending...';
                    btn.disabled = true;
                    await endCourse(id);
                    showToast('Course moved to registry', 'success');
                    setTimeout(() => window.location.reload(), 1000);
                } catch (e) {
                    console.error(e);
                    showToast('Failed to end course', 'error');
                    btn.innerText = 'End Course';
                    btn.disabled = false;
                }
            });
        });

        // Delete Logic
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Are you sure you want to PERMANENTLY delete this course? This cannot be undone.')) return;

                const id = btn.dataset.id;
                try {
                    btn.innerText = 'Deleting...';
                    btn.disabled = true;
                    await deleteCourse(id);
                    showToast('Course deleted permanently', 'success');
                    setTimeout(() => window.location.reload(), 1000);
                } catch (e) {
                    console.error(e);
                    showToast('Failed to delete', 'error');
                    btn.innerText = 'Delete';
                    btn.disabled = false;
                }
            });
        });
    }
};

export default AdminSchedule;
