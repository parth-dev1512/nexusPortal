import { getAppointments } from '../../lib/api.js';

const AdminAppointments = {
    render: async () => {
        let appointments = [];
        try {
            appointments = await getAppointments();
        } catch (e) {
            console.error(e);
        }

        const rows = appointments.map(appt => `
            <tr>
                <td style="padding: 1rem;">${appt.student_name || 'N/A'}</td>
                <td style="padding: 1rem;">
                    <div style="font-weight: 600;">${appt.course_title}</div>
                </td>
                <td style="padding: 1rem;">
                    ${new Date(appt.date).toLocaleDateString()} at ${appt.time}
                </td>
                <td style="padding: 1rem;">
                    <span style="background: #dcfce7; color: #166534; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">ACTIVE</span>
                </td>
                 <td style="padding: 1rem; text-align: right;">
                    <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">Mark Done</button>
                </td>
            </tr>
        `).join('');

        return `
            <div>
                 <header style="margin-bottom: 2rem;">
                    <h1 style="color: #fff; margin-bottom: 0.5rem;">Appointments</h1>
                    <p style="color: #ccc;">Upcoming student meetings.</p>
                </header>

                <div class="card neo-box" style="background: #fff; padding: 0; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: #f8fafc; border-bottom: 2px solid #000;">
                            <tr>
                                <th style="padding: 1rem; text-align: left;">Student</th>
                                <th style="padding: 1rem; text-align: left;">Purpose</th>
                                <th style="padding: 1rem; text-align: left;">Time</th>
                                <th style="padding: 1rem; text-align: left;">Status</th>
                                <th style="padding: 1rem; text-align: right;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${appointments.length > 0 ? rows : `<tr><td colspan="5" style="padding: 2rem; text-align: center; color: #888;">No appointments found.</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },
    afterRender: async () => {
        // ... mark done logic ...
    }
};

export default AdminAppointments;
