import { showToast } from '../components/toast.js';
import { createAppointment } from '../lib/api.js';

const BookAppointment = {
  render: async () => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return `
      <section class="container fade-in" style="padding-top: var(--spacing-xl); padding-bottom: var(--spacing-xl); max-width: 600px;">
        <h1 style="text-align: center; margin-bottom: var(--spacing-md);">Book a Discussion</h1>
        <p style="text-align: center; color: var(--color-text-muted); margin-bottom: var(--spacing-lg);">
          Schedule a time with our Academic Team via Google Calendar.
        </p>

        <div class="card" style="padding: 2rem;">
          <form id="appointment-form">
            
            <div class="form-group">
              <label for="date">Select Date</label>
              <input type="date" id="date" min="${today}" max="${nextWeek}" required>
            </div>

            <div class="form-group">
              <label for="time">Select Time Slot</label>
              <div class="grid-cols-3" style="gap: 0.5rem;" id="time-slots">
                
                <input type="radio" name="time" id="t1" value="09:00" class="time-radio" hidden checked>
                <label for="t1" class="time-slot" style="padding: 0.8rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); text-align: center; cursor: pointer; display: block; background: var(--color-bg-deep);">09:00 AM</label>

                <input type="radio" name="time" id="t2" value="10:00" class="time-radio" hidden>
                <label for="t2" class="time-slot" style="padding: 0.8rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); text-align: center; cursor: pointer; display: block; background: var(--color-bg-deep);">10:00 AM</label>

                <input type="radio" name="time" id="t3" value="11:00" class="time-radio" hidden>
                <label for="t3" class="time-slot" style="padding: 0.8rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); text-align: center; cursor: pointer; display: block; background: var(--color-bg-deep);">11:00 AM</label>

                <input type="radio" name="time" id="t4" value="13:00" class="time-radio" hidden>
                <label for="t4" class="time-slot" style="padding: 0.8rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); text-align: center; cursor: pointer; display: block; background: var(--color-bg-deep);">01:00 PM</label>

                <input type="radio" name="time" id="t5" value="14:00" class="time-radio" hidden>
                <label for="t5" class="time-slot" style="padding: 0.8rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); text-align: center; cursor: pointer; display: block; background: var(--color-bg-deep);">02:00 PM</label>

                <input type="radio" name="time" id="t6" value="15:00" class="time-radio" hidden>
                <label for="t6" class="time-slot" style="padding: 0.8rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); text-align: center; cursor: pointer; display: block; background: var(--color-bg-deep);">03:00 PM</label>
              </div>
            </div>

            <div class="form-group">
              <label for="agenda">Agenda / Notes (Optional)</label>
              <textarea id="agenda" rows="3" placeholder="Anything specific you want to discuss?"></textarea>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Confirm & Add to Calendar</button>

          </form>

          <div id="confirmed-screen" style="display: none; text-align: center; padding: 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
            <h2 style="margin-bottom: 1rem;">Appointment Confirmed!</h2>
            <p style="color: var(--color-text-muted); margin-bottom: 2rem;">
              Your slot is booked. Please verify via Google Calendar.
            </p>
            <a id="gcal-link" href="#" target="_blank" class="btn btn-primary" style="margin-bottom: 1rem;">
              📅 Open Google Calendar Invite
            </a>
            <br>
            <a href="/#/" class="btn btn-secondary">Back to Home</a>
          </div>
        </div>
      </section>
      
      <style>
        .time-radio:checked + .time-slot {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }
      </style>
    `;
  },
  afterRender: async () => {
    const form = document.getElementById('appointment-form');
    const confirmedScreen = document.getElementById('confirmed-screen');
    const gcalLinkBtn = document.getElementById('gcal-link');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const date = document.getElementById('date').value;
      const time = document.querySelector('input[name="time"]:checked').value;
      if (!date) {
        showToast('Please select a date', 'error');
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      btn.innerText = 'Creating Invite...';
      btn.disabled = true;

      const user = JSON.parse(localStorage.getItem('nexus_user'));
      const studentName = user ? user.name : 'Guest';

      try {
        // 1. Create in Supabase
        await createAppointment({
          student_name: studentName,
          course_title: 'Course Proposal Discussion',
          date: date,
          time: time,
          status: 'confirmed'
        });

        // 2. Generate Google Calendar Link
        // Using 1 hour duration
        const startDateTime = new Date(`${date}T${time}:00`);
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

        const fmt = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
        const dates = `${fmt(startDateTime)}/${fmt(endDateTime)}`;

        const text = encodeURIComponent("NEXUS: Course Discussion");
        const details = encodeURIComponent(`Discussion with ${studentName} about course proposal.`);
        const location = encodeURIComponent("Ashoka University / Google Meet");
        const emails = `parth.agarwal_ug2024@ashoka.edu.in`;

        // 'add' param attempts to add guests, but mainly works if user is sending invite
        const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}&add=${emails}`;

        gcalLinkBtn.href = gcalUrl;

        form.style.display = 'none';
        confirmedScreen.style.display = 'block';
        showToast('Appointment booked!', 'success');

        // Auto-open calendar in new tab
        window.open(gcalUrl, '_blank');

      } catch (err) {
        console.error(err);
        showToast('Failed to book. Please try again.', 'error');
        btn.innerText = 'Confirm';
        btn.disabled = false;
      }
    });
  }
};

export default BookAppointment;
