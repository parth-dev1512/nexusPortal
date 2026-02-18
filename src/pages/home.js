import { getCourses } from '../lib/api.js';
import mockCourses from '../data/courses.js';

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
    try {
      const apiCourses = await getCourses();
      courses = (apiCourses && apiCourses.length > 0) ? apiCourses : mockCourses;
    } catch (e) {
      console.warn('API fetch failed, falling back to mock', e);
      courses = mockCourses;
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
                <a href="/#/course/${s.course.id}" style="
                  display: grid;
                  grid-template-columns: 120px 1fr auto;
                  align-items: center;
                  gap: 1.5rem;
                  padding: 1rem 1.25rem;
                  background: #fff;
                  border: 2px solid #000;
                  box-shadow: 3px 3px 0px #000;
                  text-decoration: none;
                  color: #000;
                  transition: transform 0.1s, box-shadow 0.1s;
                "
                onmouseover="this.style.transform='translate(-2px,-2px)';this.style.boxShadow='5px 5px 0px #000'"
                onmouseout="this.style.transform='';this.style.boxShadow='3px 3px 0px #000'"
                >
                  <div style="font-family: var(--font-display); font-weight: 800; font-size: 1rem; color: var(--color-primary); white-space: nowrap;">
                    ${formatTime(s.start_time)}<br>
                    <span style="font-size: 0.75rem; color: #888; font-weight: 600;">→ ${formatTime(s.end_time)}</span>
                  </div>
                  <div>
                    <div style="font-weight: 800; font-size: 1.05rem; text-transform: uppercase; letter-spacing: 0.5px;">${s.course.title}</div>
                    <div style="font-size: 0.85rem; color: #666; margin-top: 0.2rem;">${s.course.instructor}</div>
                  </div>
                  <div style="font-size: 0.8rem; color: #888; text-align: right; white-space: nowrap;">
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
          <p style="font-size: 1.1rem; color: var(--color-text-muted); max-width: 600px; margin: 0 auto;">
            Discover peer-taught courses, expand your critical thinking, and share your knowledge with the Ashoka community.
          </p>
        </header>

        <!-- Upcoming Sessions Schedule -->
        <section style="margin-bottom: var(--spacing-xl);">
          <h2 style="margin-bottom: var(--spacing-md);">Upcoming Sessions</h2>
          <div class="neo-box" style="padding: 2rem; background: #fff;">
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
