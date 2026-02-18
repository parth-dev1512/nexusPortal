import { supabase } from '../lib/supabase.js';
import { showToast } from '../components/toast.js';
import { getUserApplications, getUserEnrollments, deleteEnrollment } from '../lib/api.js';

const StudentDashboard = {
  render: async () => {
    // Check if logged in
    const user = JSON.parse(localStorage.getItem('nexus_user'));
    if (!user) {
      window.location.hash = '/login';
      return 'Redirecting...';
    }

    // Fetch data from Supabase
    let applications = [];
    let myCourses = [];
    try {
      const [appData, enrollData] = await Promise.all([
        getUserApplications(user.email),
        getUserEnrollments(user.email)
      ]);
      applications = appData;
      myCourses = enrollData;
    } catch (e) {
      console.error('Failed to fetch dashboard data:', e);
    }

    const today = new Date().toISOString().split('T')[0];

    return `
      <section class="container fade-in" style="padding-top: var(--spacing-xl); padding-bottom: var(--spacing-xl);">
        
        <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <div>
            <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem; color: #fff;">My Journey</h1>
            <p style="color: var(--color-accent); font-size: 1.1rem;">Welcome back, ${user.name}</p>
          </div>
          <button id="logout-btn" class="btn btn-secondary" style="font-size: 0.9rem; padding: 0.5rem 1rem;">Log Out</button>
        </header>

        <div class="neo-box" style="padding: 2rem; background: #fff; min-height: 400px;">
          
          <!-- Enrolled Section -->
          <h2 style="color: #000; margin-bottom: 1.5rem; border-bottom: 3px solid #000; padding-bottom: 0.5rem; display: inline-block;">Current Enrollments</h2>

          ${myCourses.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              ${myCourses.map(c => {
      const nextSession = (c.sessions || []).find(s => s.date >= today);
      const nextSessionStr = nextSession
        ? `${new Date(nextSession.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at ${nextSession.start_time}`
        : 'No upcoming sessions';

      return `
                  <div class="course-row card" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; align-items: center; padding: 1rem; border: 2px solid #000; box-shadow: 4px 4px 0px #000; background: #fff; margin-bottom: 0.5rem;">
                    
                    <div>
                      <h3 style="margin: 0; font-size: 1.2rem; color: #000; text-transform: uppercase;">${c.title}</h3>
                      <span style="font-size: 0.9rem; color: var(--color-primary); font-weight: 700;">Next: ${nextSessionStr}</span>
                      <div style="font-size: 0.8rem; color: #666;">${c.location}</div>
                    </div>

                    <div style="text-align: center;">
                      <span style="
                        display: inline-block; 
                        padding: 0.25rem 0.75rem; 
                        background: ${c.status === 'enrolled' ? '#dcfce7' : '#fef9c3'}; 
                        color: #000; 
                        border: 2px solid #000; 
                        font-weight: 700; 
                        font-size: 0.8rem; 
                        text-transform: uppercase;">
                        ${c.status}
                      </span>
                    </div>

                    <div style="text-align: center;">
                      ${nextSession ? `
                        <a href="${generateCalendarLink(c, nextSession)}" target="_blank" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.8rem; font-size: 0.8rem;">
                          📅 Add to Cal
                        </a>
                      ` : ''}
                    </div>

                    <div style="text-align: right;">
                      <button class="opt-out-btn btn" data-enrollment-id="${c.enrollment_id}" style="
                        background: #fee2e2; 
                        color: #bd1e2d; 
                        border: 2px solid #bd1e2d; 
                        font-size: 0.8rem; 
                        padding: 0.4rem 0.8rem;
                      ">Opt Out</button>
                    </div>

                  </div>
                `;
    }).join('')}
            </div>
          ` : `<p style="text-align: center; color: #666; font-style: italic;">You haven't enrolled in any courses yet.</p>`}
          
          <!-- Proposed Section -->
          <h2 style="color: #000; margin-top: 3rem; margin-bottom: 1.5rem; border-bottom: 3px solid #000; padding-bottom: 0.5rem; display: inline-block;">My Course Proposals</h2>
          
          ${applications.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              ${applications.map(app => `
                  <div class="card" style="display: grid; grid-template-columns: 2fr 1fr; align-items: center; padding: 1rem; border: 2px solid #000; box-shadow: 4px 4px 0px #000; background: #f8fafc;">
                    <div>
                      <h3 style="margin: 0; font-size: 1.1rem; color: #000; text-transform: uppercase;">${app.course_title}</h3>
                      <span style="font-size: 0.85rem; color: #666;">Submitted on ${new Date(app.submitted_at).toLocaleDateString()}</span>
                    </div>
                    <div style="text-align: right;">
                      <span style="display: inline-block; padding: 0.25rem 0.75rem; background: ${app.status === 'approved' ? '#dcfce7' : (app.status === 'rejected' ? '#fee2e2' : '#e0f2fe')}; color: #000; border: 2px solid #000; font-weight: 700; font-size: 0.8rem; text-transform: uppercase;">
                        ${app.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
              `).join('')}
            </div>
          ` : `<p style="color: #666; font-style: italic;">No course proposals yet. <a href="/#/register" style="color: var(--color-primary); text-decoration: underline;">Start Teaching?</a></p>`}

          <div style="margin-top: 3rem; text-align: center;">
            <a href="/#/" class="btn btn-primary">Browse All Courses</a>
          </div>
        </div>

      </section>
    `;
  },
  afterRender: async () => {
    // Logout Logic
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('nexus_user');
        showToast('Logged out.', 'success');
        setTimeout(() => {
          window.location.hash = '/login';
          window.location.reload();
        }, 400);
      });
    }

    // Opt Out Logic
    document.querySelectorAll('.opt-out-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const enrollmentId = btn.dataset.enrollmentId;
        if (confirm('Are you sure you want to drop this course? approved seats will be lost.')) {
          try {
            await deleteEnrollment(enrollmentId);
            e.target.closest('.course-row').remove();
            showToast('You have opted out of the course.', 'success');
          } catch (err) {
            console.error(err);
            showToast('Failed to opt out. Please try again.', 'error');
          }
        }
      });
    });
  }
};

// Helper: Generate Google Calendar Link
function generateCalendarLink(course, session) {
  const title = encodeURIComponent(`NEXUS: ${course.title}`);
  const details = encodeURIComponent(`Instructor: ${course.instructor}\nLocation: ${course.location}`);
  const location = encodeURIComponent(course.location || 'Ashoka University');

  // Format: YYYYMMDDTHHMMSSZ/YYYYMMDDTHHMMSSZ
  const dateBase = session.date.replace(/-/g, '');
  const startTime = session.start_time.replace(/:/g, '') + '00';
  const endTime = session.end_time.replace(/:/g, '') + '00';

  const dates = `${dateBase}T${startTime}/${dateBase}T${endTime}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
}


export default StudentDashboard;
