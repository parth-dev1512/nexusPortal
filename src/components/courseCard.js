const CourseCard = (course) => {
    return `
    <article class="card fade-in" style="display: flex; flex-direction: column; height: 100%;">
      <h3 style="margin-bottom: 0.5rem; font-size: 1.25rem;">${course.title}</h3>
      <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1rem;">
        With <strong>${course.instructor}</strong>
      </p>
      
      <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
        ${course.tags.map(tag => `<span style="background: rgba(255,255,255,0.1); padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem;">${tag}</span>`).join('')}
      </div>

      <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.9rem;">
          📅 ${course.schedule.days.join('/')} <br>
          ⏰ ${course.schedule.time}
        </span>
        <a href="/#/course/${course.id}" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Details</a>
      </div>
    </article>
  `;
};

export default CourseCard;
