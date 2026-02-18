import { getCourses } from '../lib/api.js';
import mockCourses from '../data/courses.js';

const Search = {
  render: async () => {
    return `
      <section class="container fade-in" style="padding-top: var(--spacing-xl); padding-bottom: var(--spacing-xl);">
        <h2 style="margin-bottom: var(--spacing-md);">Find a Course</h2>
        
        <div style="margin-bottom: var(--spacing-lg);">
          <input type="text" id="search-input" placeholder="Search by name, instructor, or tag..." 
                 style="font-size: 1.2rem; padding: 1.5rem; width: 100%; border-radius: var(--radius-lg); border: 2px solid var(--color-border); background: var(--color-bg-card); color: #fff;">
        </div>

        <div id="results-container" class="grid-cols-3" style="min-height: 400px;">
          <!-- Results will appear here -->
        </div>
      </section>
    `;
  },
  afterRender: async () => {
    const input = document.getElementById('search-input');
    const container = document.getElementById('results-container');

    let courses = [];
    try {
      const apiCourses = await getCourses();
      if (apiCourses && apiCourses.length > 0) {
        courses = apiCourses;
      } else {
        courses = mockCourses;
      }
    } catch (e) {
      console.warn('API fetch failed, falling back to mock', e);
      courses = mockCourses;
    }

    const renderResults = (query) => {
      const q = query.toLowerCase();
      const results = courses.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        (c.tags && c.tags.some(t => t.toLowerCase().includes(q)))
      );

      if (results.length === 0) {
        container.innerHTML = `<div style="grid-column: span 3; text-align: center; color: var(--color-text-muted); padding: 4rem;"><h3>No results found</h3><p>Try searching for different keywords</p></div>`;
        return;
      }

      container.innerHTML = results.map(c => `
        <article class="card fade-in" style="display: flex; flex-direction: column; height: 100%;">
          <h3 style="margin-bottom: 0.5rem; font-size: 1.25rem;">${c.title}</h3>
          <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1rem;">
            With <strong>${c.instructor}</strong>
          </p>
          <div style="margin-top: auto; text-align: right;">
            <a href="/#/course/${c.id}" class="btn btn-secondary" style="width: 100%;">View Details</a>
          </div>
        </article>
      `).join('');
    };

    // Initial render
    renderResults('');

    input.addEventListener('input', (e) => {
      renderResults(e.target.value);
    });

    // Auto-focus
    input.focus();
  }
};

export default Search;
