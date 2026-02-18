import Home from './src/pages/home.js';
import Search from './src/pages/search.js';
import Register from './src/pages/register.js';
import Course from './src/pages/course.js';
import Login from './src/pages/login.js';
import StudentDashboard from './src/pages/studentDashboard.js';

import Navbar from './src/components/navbar.js';

// Admin imports
import AdminLayout from './src/pages/admin/layout.js';
import AdminLogin from './src/pages/admin/login.js';
import AdminDashboard from './src/pages/admin/dashboard.js';
import AdminApplications from './src/pages/admin/applications.js';
import AdminSchedule from './src/pages/admin/schedule.js';

const app = document.getElementById('app');

const routes = {
    '/': Home,
    '/search': Search,
    '/register': Register,
    '/login': Login,
    '/dashboard': StudentDashboard,

    // Admin Routes
    '/admin/login': AdminLogin,
    '/admin/dashboard': AdminDashboard,
    '/admin/applications': AdminApplications,
    '/admin/schedule': AdminSchedule
};

const router = async () => {
    const content = document.getElementById('app');
    const url = location.hash.slice(1).toLowerCase() || '/';

    // 1. Admin Auth Check
    if (url.startsWith('/admin') && url !== '/admin/login') {
        if (!localStorage.getItem('nexus_admin_token')) {
            window.location.hash = '/admin/login';
            return;
        }
    }

    // 2. Resolve Page
    let page = routes[url];

    // Handle dynamic routes if exact match fails
    if (!page) {
        const request = parseRequestURL();
        if (request.resource === 'course' && request.id) {
            page = Course;
        } else {
            // 404
            page = Home;
        }
    }

    // 3. Render
    if (url.startsWith('/admin')) {
        // --- Admin Layout ---
        // Remove public navbar if it exists
        const nav = document.getElementById('header_nav');
        if (nav) nav.remove();

        // Render Page inside Layout (except Login)
        if (url === '/admin/login') {
            content.innerHTML = await page.render();
            if (page.afterRender) await page.afterRender();
        } else {
            const pageContent = await page.render();
            content.innerHTML = await AdminLayout.render(pageContent);

            if (AdminLayout.afterRender) await AdminLayout.afterRender();
            if (page.afterRender) await page.afterRender();
        }

    } else {
        // --- Public Layout ---
        const nav = document.getElementById('header_nav');
        if (!nav) {
            const navContainer = document.createElement('div');
            navContainer.id = 'header_nav';
            document.body.prepend(navContainer);
            navContainer.innerHTML = await Navbar.render();
        }
        // Always refresh auth links on navigation
        await Navbar.afterRender();

        content.innerHTML = await page.render();
        if (page.afterRender) await page.afterRender();
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

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
