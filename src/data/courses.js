// Mock courses now use date-based sessions instead of weekly recurring days.
// Each session has: { date: 'YYYY-MM-DD', start_time: 'HH:MM', end_time: 'HH:MM' }

const courses = [
    {
        id: 'ai-ethics-101',
        title: 'Ethics in Artificial Intelligence',
        instructor: 'Dr. Sarah Chen',
        sessions: [
            { date: '2026-02-24', start_time: '14:00', end_time: '15:30' },
            { date: '2026-02-26', start_time: '14:00', end_time: '15:30' },
            { date: '2026-03-03', start_time: '14:00', end_time: '15:30' },
            { date: '2026-03-05', start_time: '14:00', end_time: '15:30' },
        ],
        location: 'AC01, Room 304',
        description: 'Explore the moral implications of AI development, algorithmic bias, and the future of human-machine interaction.',
        syllabus: 'Session 1: Foundations of Ethics\nSession 2: Bias in Algorithms\nSession 3: AI in Governance\nSession 4: The Future of Work',
        tags: ['AI', 'Philosophy', 'Tech'],
        capacity: 30,
        enrolled: 24,
    },
    {
        id: 'quantum-computing-intro',
        title: 'Introduction to Quantum Computing',
        instructor: 'Prof. James Miller',
        sessions: [
            { date: '2026-02-25', start_time: '10:00', end_time: '11:30' },
            { date: '2026-02-27', start_time: '10:00', end_time: '11:30' },
            { date: '2026-03-04', start_time: '10:00', end_time: '11:30' },
            { date: '2026-03-06', start_time: '10:00', end_time: '11:30' },
        ],
        location: 'AC02, Room 101',
        description: 'Understand the basics of qubits, superposition, entanglement, and quantum algorithms.',
        syllabus: 'Session 1: Qubits & Superposition\nSession 2: Quantum Gates\nSession 3: Algorithms (Shor, Grover)\nSession 4: Quantum Hardware',
        tags: ['Physics', 'Computing', 'Tech'],
        capacity: 25,
        enrolled: 18,
    },
    {
        id: 'sustainable-architecture',
        title: 'Sustainable Urban Architecture',
        instructor: 'Ar. Elena Rodriguez',
        sessions: [
            { date: '2026-02-28', start_time: '13:00', end_time: '16:00' },
            { date: '2026-03-07', start_time: '13:00', end_time: '16:00' },
            { date: '2026-03-14', start_time: '13:00', end_time: '16:00' },
            { date: '2026-03-21', start_time: '13:00', end_time: '16:00' },
        ],
        location: 'Design Studio, AC03',
        description: 'Design principles for eco-friendly buildings and smart cities.',
        syllabus: 'Session 1: Green Materials\nSession 2: Energy Efficiency\nSession 3: Urban Planning\nSession 4: Case Studies',
        tags: ['Architecture', 'Design', 'Sustainability'],
        capacity: 20,
        enrolled: 20,
    },
    {
        id: 'digital-marketing-strategy',
        title: 'Digital Marketing in 2026',
        instructor: 'Mark Thompson',
        sessions: [
            { date: '2026-02-23', start_time: '16:00', end_time: '17:30' },
            { date: '2026-02-25', start_time: '16:00', end_time: '17:30' },
            { date: '2026-03-02', start_time: '16:00', end_time: '17:30' },
            { date: '2026-03-04', start_time: '16:00', end_time: '17:30' },
        ],
        location: 'AC01, Room 201',
        description: 'Master SEO, social media algorithms, and content strategy for the modern web.',
        syllabus: 'Session 1: SEO Fundamentals\nSession 2: Social Media Algorithms\nSession 3: Content Marketing\nSession 4: Analytics',
        tags: ['Marketing', 'Business'],
        capacity: 40,
        enrolled: 12,
    },
    {
        id: 'creative-writing-workshop',
        title: 'Creative Writing Workshop',
        instructor: 'Author Lily Green',
        sessions: [
            { date: '2026-02-24', start_time: '18:00', end_time: '20:00' },
            { date: '2026-03-03', start_time: '18:00', end_time: '20:00' },
            { date: '2026-03-10', start_time: '18:00', end_time: '20:00' },
            { date: '2026-03-17', start_time: '18:00', end_time: '20:00' },
        ],
        location: 'Library Seminar Room',
        description: 'Refine your storytelling skills through weekly prompts and peer review.',
        syllabus: 'Session 1: Character Development\nSession 2: Plot Structure\nSession 3: Dialogue\nSession 4: Editing',
        tags: ['Arts', 'Writing'],
        capacity: 15,
        enrolled: 8,
    }
];

export default courses;
