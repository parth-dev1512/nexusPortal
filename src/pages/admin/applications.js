import { getPendingApplications, approveApplication, rejectApplication } from '../../lib/api.js';
import { showToast } from '../../components/toast.js';

const AdminApplications = {
    render: async () => {
        let apps = [];
        try {
            apps = await getPendingApplications();
        } catch (e) {
            console.error('Failed to load apps');
        }

        const appList = apps.length > 0
            ? apps.map(app => `
                <div class="application-card card" data-id="${app.id}" style="background: #fff; padding: 1.5rem; margin-bottom: 1rem; border: 1px solid #ddd; cursor: pointer; transition: 0.2s;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <h3 style="margin: 0; font-size: 1.2rem; color: #000;">${app.course_title}</h3>
                            <p style="color: #666; font-size: 0.9rem; margin-top: 0.25rem;">by ${app.instructor_name} (${app.email})</p>
                        </div>
                        <div style="text-align: right;">
                            <span style="font-size: 0.8rem; background: #e0f2fe; color: #0369a1; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 600;">PENDING</span>
                            <div style="font-size: 0.8rem; color: #999; margin-top: 0.5rem;">${new Date(app.submitted_at).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>
            `).join('')
            : `<div style="text-align: center; padding: 4rem; color: #888; background: #fff; border-radius: 8px;">No pending applications. Good job!</div>`;

        return `
            <div>
                <header style="margin-bottom: 2rem;">
                    <h1 style="color: #fff; margin-bottom: 0.5rem;">Application Inbox</h1>
                    <p style="color: #ccc;">Review and approve student-led courses.</p>
                </header>

                <div>${appList}</div>

                <!-- Review Modal -->
                <div id="review-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(5px);">
                    <div class="card neo-box" style="width: 90%; max-width: 600px; padding: 0; background: #fff; position: relative; max-height: 90vh; overflow-y: auto;">
                        
                        <div style="padding: 2rem; border-bottom: 1px solid #eee;">
                            <button id="close-review" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                            <h2 style="margin: 0; font-size: 1.5rem;">Review Application</h2>
                        </div>

                        <div id="modal-content" style="padding: 2rem;">
                            <!-- Dynamic Content -->
                        </div>

                        <div style="padding: 2rem; background: #f9f9f9; border-top: 1px solid #eee;">
                            <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">Assign Sessions</h3>
                            
                            <div id="sessions-list" style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem;">
                                <!-- Session rows added dynamically -->
                            </div>

                            <button type="button" id="add-session-btn" class="btn btn-secondary" style="width: 100%; margin-bottom: 1.5rem; font-size: 0.9rem;">
                                + Add Session
                            </button>

                            <div class="form-group">
                                <label style="font-weight: 600; display: block; margin-bottom: 0.5rem;">Location</label>
                                <input type="text" id="sched-location" placeholder="e.g. AC01, Room 304" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc;">
                            </div>

                            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                                <button id="btn-approve" class="btn btn-primary" style="flex: 1;">Approve &amp; Publish</button>
                                <button id="btn-reject" class="btn btn-secondary" style="flex: 1; background: #fee2e2; color: #bd1e2d; border-color: #bd1e2d;">Reject</button>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        `;
    },
    afterRender: async () => {
        const apps = await getPendingApplications();
        const modal = document.getElementById('review-modal');
        const contentDiv = document.getElementById('modal-content');
        let currentAppId = null;

        // Helper: add a session row to the sessions list
        function addSessionRow() {
            const list = document.getElementById('sessions-list');
            const row = document.createElement('div');
            row.className = 'session-row';
            row.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 0.5rem; align-items: center;';
            row.innerHTML = `
                <input type="date" class="sess-date" style="padding: 0.5rem; border: 1px solid #ccc; font-size: 0.9rem;">
                <input type="time" class="sess-start" placeholder="Start" style="padding: 0.5rem; border: 1px solid #ccc; font-size: 0.9rem;">
                <input type="time" class="sess-end" placeholder="End" style="padding: 0.5rem; border: 1px solid #ccc; font-size: 0.9rem;">
                <button type="button" class="remove-session" style="background: #fee2e2; border: 1px solid #bd1e2d; color: #bd1e2d; padding: 0.5rem 0.75rem; cursor: pointer; font-size: 1rem; font-weight: 700;">&times;</button>
            `;
            row.querySelector('.remove-session').addEventListener('click', () => row.remove());
            list.appendChild(row);
        }

        // Open Modal Logic
        document.querySelectorAll('.application-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                const app = apps.find(a => a.id === id);
                if (!app) return;

                currentAppId = id;
                contentDiv.innerHTML = `
                    <div style="margin-bottom: 1.5rem;">
                        <label style="font-weight: 700; color: #666; font-size: 0.8rem; text-transform: uppercase;">Course Title</label>
                        <div style="font-size: 1.2rem; margin-top: 0.25rem;">${app.course_title}</div>
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <label style="font-weight: 700; color: #666; font-size: 0.8rem; text-transform: uppercase;">Instructor</label>
                        <div style="font-size: 1.1rem; margin-top: 0.25rem;">${app.instructor_name}</div>
                        <div style="color: #666;">${app.email}</div>
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <label style="font-weight: 700; color: #666; font-size: 0.8rem; text-transform: uppercase;">Brief</label>
                        <p style="line-height: 1.5;">${app.course_brief}</p>
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <label style="font-weight: 700; color: #666; font-size: 0.8rem; text-transform: uppercase;">Syllabus Proposal</label>
                        <pre style="background: #f1f5f9; padding: 1rem; white-space: pre-wrap; font-family: inherit; font-size: 0.9rem;">${app.syllabus_proposal}</pre>
                    </div>
                    ${app.planned_capacity ? `
                    <div style="margin-bottom: 1.5rem;">
                        <label style="font-weight: 700; color: #666; font-size: 0.8rem; text-transform: uppercase;">Planned Capacity</label>
                        <div style="font-size: 1.1rem; margin-top: 0.25rem;">${app.planned_capacity} students</div>
                    </div>` : ''}
                `;

                // Clear sessions list and add one empty row to start
                document.getElementById('sessions-list').innerHTML = '';
                addSessionRow();

                modal.style.display = 'flex';
            });
        });

        // Add Session Button
        document.getElementById('add-session-btn').addEventListener('click', addSessionRow);

        // Close Modal
        document.getElementById('close-review').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Approve Logic
        document.getElementById('btn-approve').addEventListener('click', async () => {
            if (!currentAppId) return;

            // Collect sessions
            const sessions = [];
            document.querySelectorAll('.session-row').forEach(row => {
                const date = row.querySelector('.sess-date').value;
                const start_time = row.querySelector('.sess-start').value;
                const end_time = row.querySelector('.sess-end').value;
                if (date && start_time && end_time) {
                    sessions.push({ date, start_time, end_time });
                }
            });

            const location = document.getElementById('sched-location').value;

            if (sessions.length === 0) {
                showToast('Please add at least one session', 'error');
                return;
            }
            if (!location) {
                showToast('Please enter a location', 'error');
                return;
            }

            try {
                document.getElementById('btn-approve').innerText = 'Publishing...';
                await approveApplication(currentAppId, { sessions, location });
                showToast('Course Approved & Published!', 'success');
                modal.style.display = 'none';
                setTimeout(() => window.location.reload(), 1000);
            } catch (e) {
                console.error('Approval Error:', e);
                showToast(`Failed to approve: ${e.message || 'Unknown error'}`, 'error');
                document.getElementById('btn-approve').innerText = 'Approve & Publish';
                document.getElementById('btn-approve').disabled = false;
            }
        });

        // Reject Logic
        document.getElementById('btn-reject').addEventListener('click', async () => {
            if (!currentAppId) return;
            if (!confirm('Are you sure you want to reject this application?')) return;

            try {
                await rejectApplication(currentAppId);
                showToast('Application Rejected', 'success');
                modal.style.display = 'none';
                setTimeout(() => window.location.reload(), 1000);
            } catch (e) {
                console.error(e);
                showToast('Failed to reject', 'error');
            }
        });
    }
};

export default AdminApplications;
