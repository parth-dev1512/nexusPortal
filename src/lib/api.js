import { supabase } from './supabase.js';

// --- ADMIN AUTH ---

export async function adminLogin(username, password) {
    // 1. Mock Login Fallback (for development/offline)
    if (username === 'admin' && password === 'admin123') {
        console.log('Using mock admin login');
        return { success: true, adminId: 'mock-admin' };
    }

    // 2. Error if Supabase is not initialized
    if (!supabase) {
        throw new Error('Database connection is not established. Please check your configuration.');
    }

    const { data, error } = await supabase
        .from('admin_users')
        .select('id, username, password_hash')
        .eq('username', username.trim().toLowerCase())
        .single();

    if (error || !data) {
        return { success: false, message: 'Invalid username or password.' };
    }

    // Plain-text comparison for MVP. Use bcrypt in production.
    if (data.password_hash !== password) {
        return { success: false, message: 'Invalid username or password.' };
    }

    return { success: true, adminId: data.id };
}

// --- COURSES ---

export async function getCourses(status = 'approved') {
    if (!supabase) throw new Error('Database connection required');

    let query = supabase
        .from('courses')
        .select('*');

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching courses:', error);
        return [];
    }

    return data;
}

export async function getCourseById(id) {
    if (!supabase) throw new Error('Database connection required');

    // 1. Get Course Details
    const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

    if (courseError) {
        console.error('Error fetching course:', courseError);
        return null;
    }

    // 2. Get Enrollment Count
    const { count, error: countError } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', id)
        .eq('status', 'enrolled');

    return {
        ...course,
        enrolled_count: count || 0
    };
}

// --- APPLICATIONS ---

export async function submitApplication(appData) {
    if (!supabase) throw new Error('Database connection required');

    const { data, error } = await supabase
        .from('applications')
        .insert([
            {
                applicant_id: appData.applicant_id,
                instructor_name: appData.instructor_name,
                email: appData.email,
                course_title: appData.course_title,
                course_brief: appData.course_brief,
                syllabus_proposal: appData.syllabus_proposal,
                experience: appData.experience,
                planned_capacity: appData.planned_capacity || 30,
                status: 'pending'
            }
        ]);

    if (error) throw error;
    return data;
}

export async function getUserApplications(email) {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('email', email)
        .order('submitted_at', { ascending: false });

    if (error) {
        console.error('Error fetching applications:', error);
        return [];
    }
    return data;
}

// --- ENROLLMENTS ---

export async function enrollStudent(courseId, studentDetails) {
    if (!supabase) throw new Error('Database connection required');

    const userJson = localStorage.getItem('nexus_user');
    if (!userJson) throw new Error('User must be logged in to enroll');
    const user = JSON.parse(userJson);

    // 1. Ensure Profile exists
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            email: user.email,
            full_name: studentDetails.name,
            year: studentDetails.year,
            batch: studentDetails.batch,
            avatar_url: user.avatar
        }, { onConflict: 'id' })
        .select()
        .single();

    if (profileError) {
        console.error('Profile sync error:', profileError);
        throw new Error('Failed to sync user profile. Please try again.');
    }

    // 2. Insert into enrollments
    const { error } = await supabase
        .from('enrollments')
        .insert([{
            user_id: user.id,
            course_id: courseId,
            status: 'enrolled'
        }]);

    if (error) {
        if (error.code === '23505') return { success: true, alreadyEnrolled: true };
        throw error;
    }

    return { success: true };
}

export async function getUserEnrollments(email) {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('enrollments')
        .select(`
            *,
            courses (*)
        `)
        .eq('profiles.email', email);

    if (error) {
        console.error('Error fetching enrollments:', error);
        return [];
    }

    return data.map(e => ({
        ...e.courses,
        status: e.status,
        enrollment_id: e.id,
        sessions: e.courses.sessions,
        location: e.courses.location
    }));
}

// --- ADMIN ---

export async function getDashboardStats() {
    if (!supabase) throw new Error('Database connection required');

    const { count: pendingApps } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    const { count: activeCourses } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

    return {
        pendingApps: pendingApps || 0,
        activeCourses: activeCourses || 0
    };
}

export async function getPendingApplications() {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: true });

    if (error) {
        console.error('Error fetching pending apps:', error);
        return [];
    }
    return data;
}

export async function approveApplication(appId, scheduleData) {
    if (!supabase) throw new Error('Database connection required for approval.');

    console.log('🔄 Approving Application:', appId, scheduleData);

    const { data: app, error: fetchError } = await supabase
        .from('applications')
        .select('*')
        .eq('id', appId)
        .single();

    if (fetchError || !app) {
        throw new Error('Application details not found.');
    }

    const { error: courseError } = await supabase.from('courses').insert([{
        title: app.course_title,
        instructor: app.instructor_name,
        description: app.course_brief,
        syllabus: app.syllabus_proposal,
        sessions: scheduleData.sessions,
        location: scheduleData.location,
        max_capacity: app.planned_capacity || 30,
        tags: ['Student-Led'],
        status: 'approved'
    }]);

    if (courseError) throw courseError;

    const { error: appError } = await supabase
        .from('applications')
        .update({ status: 'approved' })
        .eq('id', appId);

    if (appError) throw appError;

    return { success: true };
}

export async function rejectApplication(appId) {
    if (!supabase) throw new Error('Database connection required.');
    const { error } = await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('id', appId);

    if (error) throw error;
    return { success: true };
}

export async function deleteCourse(id) {
    if (!supabase) throw new Error('Database connection required.');
    const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return { success: true };
}

export async function endCourse(id) {
    if (!supabase) throw new Error('Database connection required.');
    const { error } = await supabase
        .from('courses')
        .update({ status: 'ended' })
        .eq('id', id);

    if (error) throw error;
    return { success: true };
}

export async function getEndedCourses() {
    return getCourses('ended');
}

export async function deleteEnrollment(id) {
    if (!supabase) throw new Error('Database connection required.');
    const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return { success: true };
}
