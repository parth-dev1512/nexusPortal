import { submitApplication } from '../lib/api.js';
import { showToast } from '../components/toast.js';

const Register = {
  render: async () => {
    return `
      <section class="container fade-in" style="padding-top: var(--spacing-xl); padding-bottom: var(--spacing-xl); max-width: 800px;">
        <h1 style="text-align: center; margin-bottom: var(--spacing-lg);">Register a New Course</h1>
        
        <div class="card" style="padding: 2rem;">
          <form id="register-form">
            
            <h3 style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">Instructor Details</h3>
            
            <div class="grid-cols-2">
              <div class="form-group">
                <label for="name">Full Name</label>
                <input type="text" id="name" required placeholder="e.g. Alex Johnson">
              </div>
              
              <div class="form-group">
                <label for="phone">Phone Number</label>
                <input type="tel" id="phone" required placeholder="+1 (555) 000-0000">
              </div>
            </div>

            <div class="form-group">
              <label for="email">University Email</label>
              <input type="email" id="email" required placeholder="alex.j@ashoka.edu.in" pattern=".+@.+\\.edu\\.in">
              <small style="color: var(--color-text-muted); display: block; margin-top: 0.5rem;">Must be a valid .edu.in address</small>
            </div>

            <div class="form-group">
              <label for="experience">Experience in the Field</label>
              <textarea id="experience" rows="3" required placeholder="Briefly describe your background..."></textarea>
            </div>

            <h3 style="margin-top: 2rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">Course Proposal</h3>

            <div class="form-group">
              <label for="course-name">Course Name</label>
              <input type="text" id="course-name" required placeholder="e.g. Advanced Python for Data Science">
            </div>

            <div class="form-group">
              <label for="brief">Course Brief (Summary)</label>
              <textarea id="brief" rows="3" required placeholder="What is this course about?"></textarea>
            </div>

            <div class="form-group">
              <label for="syllabus">Structure &amp; Syllabus</label>
              <textarea id="syllabus" rows="6" required placeholder="Week 1: Topic...\nWeek 2: Topic..."></textarea>
            </div>

            <div class="form-group">
              <label for="planned-capacity">Planned Capacity</label>
              <input type="number" id="planned-capacity" required min="5" max="200" placeholder="e.g. 30">
              <small style="color: var(--color-text-muted); display: block; margin-top: 0.5rem;">Minimum 5, maximum 200 students</small>
            </div>

            <div style="margin-top: 2rem; text-align: right;">
              <button type="submit" class="btn btn-primary" style="padding: 1rem 2rem; font-size: 1.1rem;">Submit Application</button>
            </div>

          </form>

          <div id="success-screen" style="display: none; text-align: center; padding: 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
            <h2 style="margin-bottom: 1rem;">Application Submitted!</h2>
            <p style="color: var(--color-text-muted); margin-bottom: 2rem;">
              Thank you for your interest in teaching at NEXUS. Your proposal has been received. Let's discuss the details!
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
              <a href="/#/" class="btn btn-secondary">Back to Home</a>
              <a href="/#/dashboard" class="btn btn-primary">Go to Dashboard</a>
            </div>
          </div>
        </div>
      </section>
    `;
  },
  afterRender: async () => {
    const form = document.getElementById('register-form');
    const successScreen = document.getElementById('success-screen');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value;
      if (!email.endsWith('.edu.in')) {
        showToast('Please use a valid .edu.in email address', 'error');
        return;
      }

      const user = JSON.parse(localStorage.getItem('nexus_user'));

      const appData = {
        applicant_id: user ? user.id : null,
        instructor_name: document.getElementById('name').value,
        email: email,
        course_title: document.getElementById('course-name').value,
        course_brief: document.getElementById('brief').value,
        syllabus_proposal: document.getElementById('syllabus').value,
        experience: document.getElementById('experience').value,
        planned_capacity: parseInt(document.getElementById('planned-capacity').value, 10) || 30
      };

      const btn = form.querySelector('button[type="submit"]');
      btn.innerText = 'Submitting...';
      btn.disabled = true;

      try {
        await submitApplication(appData);

        form.style.display = 'none';
        successScreen.style.display = 'block';
        showToast('Application submitted successfully!', 'success');
      } catch (err) {
        console.error('Submission error:', err);
        showToast('Failed to submit application. Please check your connection.', 'error');
        btn.innerText = 'Submit Application';
        btn.disabled = false;
      }
    });
  }
};

export default Register;
