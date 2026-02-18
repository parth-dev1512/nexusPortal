import { getCourseById, enrollStudent } from '../lib/api.js';
import mockCourses from '../data/courses.js';
import { showToast } from '../components/toast.js';

const Course = {
  render: async () => {
    const request = parseRequestURL();
    const id = request.id;
    let course = null;

    if (id && id.startsWith('course-')) {
      course = mockCourses.find(c => c.id === id);
    } else {
      course = await getCourseById(id);
    }

    if (!course) {
      return `<div class="container" style="padding: 4rem; text-align: center;"><h2>Course not found</h2><a href="/#/" class="btn btn-secondary">Go Home</a></div>`;
    }

    const today = new Date().toISOString().split('T')[0];
    const enrolledCount = course.enrolled_count || 0;
    const capacity = course.max_capacity || 30;
    const isFull = enrolledCount >= capacity;

    // Sort sessions by date to find the first one
    const sortedSessions = [...(course.sessions || [])].sort((a, b) => a.date.localeCompare(b.date));
    const firstSession = sortedSessions[0];
    const hasStarted = firstSession && firstSession.date < today;

    let enrollButtonHtml = '';
    let statusMessage = 'Spots are filling up fast!';

    if (hasStarted) {
      enrollButtonHtml = `
        <button class="btn" disabled style="width: 100%; font-size: 1.1rem; padding: 1.25rem; background: #f1f5f9; color: #64748b; border: 2px solid #cbd5e1; cursor: not-allowed;">
          Course Started
        </button>
      `;
      statusMessage = 'Enrollment is closed as the course has already started.';
    } else if (isFull) {
      enrollButtonHtml = `
        <button class="btn" disabled style="width: 100%; font-size: 1.1rem; padding: 1.25rem; background: #f1f5f9; color: #bd1e2d; border: 2px solid #bd1e2d; cursor: not-allowed;">
          Course Full
        </button>
      `;
      statusMessage = 'This course has reached its maximum capacity.';
    } else {
      enrollButtonHtml = `
        <button id="enroll-btn" class="btn btn-primary" style="width: 100%; font-size: 1.1rem; padding: 1.25rem;">
          Enroll Now
        </button>
      `;
    }

    return `
      <section class="container fade-in" style="padding-top: var(--spacing-xl); padding-bottom: var(--spacing-xl);">
        <a href="/#/" class="btn btn-secondary" style="margin-bottom: 2rem; display: inline-flex; align-items: center; gap: 0.5rem;">
          ← Back to Courses
        </a>

        <!-- Hero Header -->
        <div class="neo-box" style="background: var(--color-primary); padding: 3rem; margin-bottom: 2rem; position: relative; overflow: hidden;">
          <div style="position: absolute; top: -20px; right: -20px; width: 200px; height: 200px; border: 4px solid rgba(255,255,255,0.1); border-radius: 50%;"></div>
          <div style="position: absolute; bottom: -40px; right: 60px; width: 120px; height: 120px; border: 4px solid rgba(255,255,255,0.08); border-radius: 50%;"></div>
          <div style="position: relative; z-index: 1;">
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.25rem;">
              ${(course.tags || ['Student-Led']).map(tag => `
                <span style="background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3); padding: 0.25rem 0.75rem; font-size: 0.8rem; font-family: var(--font-display); font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">${tag}</span>
              `).join('')}
            </div>
            <h1 style="font-size: 3rem; color: #fff; margin-bottom: 0.75rem; text-shadow: 3px 3px 0px rgba(0,0,0,0.3); line-height: 1.1;">${course.title}</h1>
            <p style="font-size: 1.2rem; color: rgba(255,255,255,0.85); font-family: var(--font-body);">Taught by <strong style="color: #fff;">${course.instructor}</strong></p>
          </div>
        </div>

        <!-- Content Grid -->
        <div class="grid-cols-3" style="gap: 2rem; align-items: start;">

          <!-- Main Content -->
          <div style="grid-column: span 2; display: flex; flex-direction: column; gap: 2rem;">

            <div class="neo-box" style="background: #fff; padding: 2rem;">
              <h2 style="color: #000; margin-bottom: 1rem; font-size: 1.5rem;">About this Course</h2>
              <p style="line-height: 1.9; color: #333; font-size: 1.05rem;">${course.description}</p>
            </div>

            <div class="neo-box" style="background: #fff; padding: 2rem;">
              <h2 style="color: #000; margin-bottom: 1rem; font-size: 1.5rem;">Syllabus Overview</h2>
              <pre style="font-family: var(--font-body); white-space: pre-wrap; line-height: 1.8; color: #444; font-size: 0.95rem;">${course.syllabus}</pre>
            </div>

          </div>

          <!-- Sidebar -->
          <aside style="grid-column: span 1; position: sticky; top: 100px; display: flex; flex-direction: column; gap: 1.5rem;">

            <div class="neo-box" style="background: #fff; padding: 1.75rem;">
              <h3 style="color: #000; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 3px solid #000; font-size: 1.1rem; text-transform: uppercase;">Course Details</h3>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 1.25rem;">
                <li style="display: flex; flex-direction: column; gap: 0.5rem;">
                  <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #888; font-weight: 700;">Sessions</span>
                  <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                    ${(course.sessions || []).map((s, i) => {
      const d = new Date(s.date + 'T00:00:00');
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
      const dToday = new Date().toISOString().split('T')[0];
      const sPast = s.date < dToday;
      return `<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0.6rem; background: ${sPast ? '#f8fafc' : '#fff'}; border: 1px solid ${sPast ? '#e2e8f0' : '#000'}; font-size: 0.85rem; ${sPast ? 'opacity: 0.5;' : ''}">
                        <span style="font-weight: 600;">${i + 1}. ${label}</span>
                        <span style="color: #555;">${s.start_time} – ${s.end_time}</span>
                      </div>`;
    }).join('') || '<span style="color:#888; font-size:0.85rem;">No sessions scheduled</span>'}
                  </div>
                </li>
                <li style="display: flex; flex-direction: column; gap: 0.2rem;">
                  <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #888; font-weight: 700;">Location</span>
                  <span style="font-weight: 600; color: #000;">${course.location || 'AC01, Room 304'}</span>
                </li>
                <li style="display: flex; flex-direction: column; gap: 0.2rem;">
                  <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #888; font-weight: 700;">Capacity</span>
                  <span style="font-weight: 600; color: #000;">${enrolledCount} / ${capacity} filled</span>
                </li>
              </ul>
            </div>

            <div id="enroll-section">
              ${enrollButtonHtml}
              <p style="text-align: center; margin-top: 0.75rem; font-size: 0.8rem; color: ${isFull || hasStarted ? '#bd1e2d' : 'var(--color-text-muted)'}; font-weight: ${isFull || hasStarted ? '600' : 'normal'};">
                ${statusMessage}
              </p>
            </div>

          </aside>
        </div>

        <!-- Enrollment Modal -->
        <div id="enroll-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(5px);">
          <div class="card neo-box" style="width: 90%; max-width: 500px; padding: 2rem; position: relative; background: #fff;">
            <button id="close-modal" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #000;">&times;</button>
            <h2 style="margin-bottom: 1.5rem; text-align: center; color: #000;">Student Enrollment</h2>
            
            <form id="enroll-form">
              <div class="form-group">
                <label for="student-name">Full Name</label>
                <input type="text" id="student-name" required placeholder="e.g. Aditi Sharma">
              </div>
              
              <div class="grid-cols-2" style="gap: 1rem;">
                <div class="form-group">
                  <label for="year">Year</label>
                  <select id="year" required>
                    <option value="">Select Year</option>
                    <option value="UG1">UG1</option>
                    <option value="UG2">UG2</option>
                    <option value="UG3">UG3</option>
                    <option value="UG4">UG4 (ASP)</option>
                    <option value="YIF">YIF</option>
                    <option value="Master">Masters/PhD</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="batch">Batch</label>
                  <input type="text" id="batch" required placeholder="e.g. 2026">
                </div>
              </div>

              <div class="form-group">
                <label for="student-email">Ashoka Email</label>
                <input type="email" id="student-email" required placeholder="name.lastname@ashoka.edu.in" pattern=".+@ashoka\.edu\.in">
                <small style="color: #666; font-size: 0.8rem; margin-top: 0.25rem;">Must be @ashoka.edu.in</small>
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%;">Confirm Enrollment</button>
            </form>
          </div>
        </div>
      </section>
    `;
  },
  afterRender: async () => {
    const btn = document.getElementById('enroll-btn');
    const modal = document.getElementById('enroll-modal');
    const closeBtn = document.getElementById('close-modal');
    const form = document.getElementById('enroll-form');
    const enrollSection = document.getElementById('enroll-section');

    if (btn) {
      btn.addEventListener('click', () => {
        modal.style.display = 'flex';
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    // Close on outside click
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('student-name').value;
        const year = document.getElementById('year').value;
        const batch = document.getElementById('batch').value;
        const email = document.getElementById('student-email').value;

        if (!email.endsWith('@ashoka.edu.in')) {
          showToast('Please use a valid Ashoka email', 'error');
          return;
        }

        const request = parseRequestURL();
        const courseId = request.id;

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerText = 'Enrolling...';
        submitBtn.disabled = true;

        try {
          const result = await enrollStudent(courseId, { name, year, batch, email });

          // Success
          modal.style.display = 'none';
          if (result.alreadyEnrolled) {
            showToast('You are already enrolled in this course!', 'info');
          } else {
            showToast('Success! Enrollment Confirmed.', 'success');
          }

          if (btn) {
            btn.innerText = 'Enrolled';
            btn.className = 'btn btn-secondary'; // Change style to indicate state
            btn.disabled = true;
            btn.style.opacity = '1';
            btn.style.cursor = 'default';
            btn.style.borderColor = '#bd1e2d';
            btn.style.color = '#bd1e2d';
          }
        } catch (err) {
          console.error(err);
          showToast('Enrollment failed. Please ensure you are logged in.', 'error');
          submitBtn.innerText = 'Confirm Enrollment';
          submitBtn.disabled = false;
        }
      });
    }
  }
};

function parseRequestURL() {
  const url = location.hash.slice(1).toLowerCase() || '/';
  const r = url.split('/');
  return {
    resource: r[1],
    id: r[2],
    verb: r[3],
  };
}

export default Course;
