import { getCourses } from '../lib/api.js';

// Format date nicely: "Mon, 24 Feb"
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

// Format time: "14:00" → "2:00 PM"
function formatTime(t) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

// Check if a date is today
function isToday(dateStr) {
  return dateStr === new Date().toISOString().split('T')[0];
}

const Home = {
  render: async () => {
    let courses = [];
    let error = null;
    try {
      courses = await getCourses();
      if (!courses || courses.length === 0) {
        // Option: we could treat empty courses as a non-error but show a "no courses" message
        // However, the user wants to load from DB and show error if unable.
      }
    } catch (e) {
      console.error('Failed to load courses from database:', e);
      error = "Unable to connect to the database. Please check your connection or try again later.";
    }

    if (error) {
      return `
        <div class="container fade-in" style="padding: 4rem 1rem; text-align: center;">
          <div class="neo-box" style="padding: 2rem; background: #fff; max-width: 600px; margin: 0 auto;">
            <h1 style="color: var(--color-primary); margin-bottom: 1.5rem;">Connection Error</h1>
            <p style="color: var(--color-text-muted); margin-bottom: 2rem; font-size: 1.1rem;">
              We're having trouble reaching our database to load the latest courses.
            </p>
            <div style="background: #fff5f5; border: 1px solid #feb2b2; color: #c53030; padding: 1rem; border-radius: 4px; margin-bottom: 2rem; font-size: 0.9rem; font-family: monospace; word-break: break-word;">
              ${error}
            </div>
            <button onclick="location.reload()" class="btn btn-primary" style="width: 100%;">Try Again</button>
          </div>
        </div>
      `;
    }

    const today = new Date().toISOString().split('T')[0];

    // Build a flat list of upcoming sessions across all courses, sorted by date then time
    const upcomingSessions = [];
    courses.forEach(course => {
      const sessions = course.sessions || [];
      sessions.forEach(session => {
        if (session.date >= today) {
          upcomingSessions.push({ ...session, course });
        }
      });
    });
    upcomingSessions.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.start_time.localeCompare(b.start_time);
    });

    // Group by date
    const grouped = {};
    upcomingSessions.forEach(s => {
      if (!grouped[s.date]) grouped[s.date] = [];
      grouped[s.date].push(s);
    });

    const scheduleHtml = Object.keys(grouped).length > 0
      ? Object.entries(grouped).map(([date, sessions]) => `
          <div style="margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
              <div style="
                background: ${isToday(date) ? 'var(--color-primary)' : '#000'};
                color: #fff;
                padding: 0.4rem 1rem;
                font-family: var(--font-display);
                font-weight: 800;
                font-size: 0.85rem;
                text-transform: uppercase;
                letter-spacing: 1px;
                white-space: nowrap;
              ">${isToday(date) ? 'TODAY' : ''} ${formatDate(date)}</div>
              <div style="flex: 1; height: 2px; background: #000;"></div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${sessions.map(s => `
                <a href="/#/course/${s.course.id}" class="schedule-row">
                  <div style="font-family: var(--font-display); font-weight: 800; font-size: 1rem; color: var(--color-primary); white-space: nowrap;">
                    ${formatTime(s.start_time)}<br>
                    <span style="font-size: 0.75rem; color: #888; font-weight: 600;">→ ${formatTime(s.end_time)}</span>
                  </div>
                  <div>
                    <div style="font-weight: 800; font-size: 1.05rem; text-transform: uppercase; letter-spacing: 0.5px;">${s.course.title}</div>
                    <div style="font-size: 0.85rem; color: #666; margin-top: 0.2rem;">${s.course.instructor}</div>
                  </div>
                  <div class="schedule-location" style="font-size: 0.8rem; color: #888; text-align: right; white-space: nowrap;">
                    ${s.course.location || ''}
                  </div>
                </a>
              `).join('')}
            </div>
          </div>
        `).join('')
      : `<div style="text-align: center; padding: 3rem; color: #888; font-style: italic;">No upcoming sessions scheduled.</div>`;

    return `
      <section class="container fade-in" style="padding-top: var(--spacing-xl); padding-bottom: var(--spacing-xl);">
        
         <header style="text-align: center; margin-bottom: var(--spacing-xl);">
          <h1 style="margin-bottom: 0.5rem;">Ashoka's skill sharing platform</h1>
        </header>

        <!-- Upcoming Sessions Schedule -->
        <section style="margin-bottom: var(--spacing-xl);">
          <h2 style="margin-bottom: var(--spacing-md);">Upcoming Sessions</h2>
          <div class="neo-box" style="padding: 1.5rem; background: #fff;">
            ${scheduleHtml}
          </div>
        </section>

        <!-- All Courses Grid -->
        <section>
          <h2 style="margin-bottom: var(--spacing-md);">All Courses</h2>
          <div class="grid-cols-3">
            ${courses.map(c => {
      const nextSession = (c.sessions || []).find(s => s.date >= today);
      return `
                <article class="card fade-in" style="display: flex; flex-direction: column; height: 100%;">
                  <h3 style="margin-bottom: 0.5rem; font-size: 1.25rem;">${c.title}</h3>
                  <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 0.75rem;">
                    With <strong>${c.instructor}</strong>
                  </p>
                  ${nextSession ? `
                    <div style="font-size: 0.8rem; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 0.4rem 0.75rem; display: inline-block; margin-bottom: 1rem; font-weight: 600; color: #166534;">
                      Next: ${formatDate(nextSession.date)} at ${formatTime(nextSession.start_time)}
                    </div>
                  ` : `
                    <div style="font-size: 0.8rem; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 0.4rem 0.75rem; display: inline-block; margin-bottom: 1rem; color: #64748b;">
                      No upcoming sessions
                    </div>
                  `}
                  <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--color-border);">
                    <a href="/#/course/${c.id}" class="btn btn-secondary" style="width: 100%;">View Details</a>
                  </div>
                </article>
              `;
    }).join('')}
          </div>
        </section>

      </section>
    `;
  },
  afterRender: async () => { }
};

export default Home;
