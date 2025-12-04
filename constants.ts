
import { Role, View, User, Document, Ticket, TicketStatus, TicketPriority, Circular, DirectoryUser } from './types';

export const ROLES = {
    SUPER_ADMIN: Role.SUPER_ADMIN,
    ADMIN: Role.ADMIN,
    STAFF: Role.STAFF,
    FACULTY: Role.FACULTY,
};

export const VIEWS = {
    DASHBOARD: View.DASHBOARD,
    DIRECTORY: View.DIRECTORY,
    DOCUMENTS: View.DOCUMENTS,
    CIRCULARS: View.CIRCULARS,
    TICKETS: View.TICKETS,
};

export const MOCK_USER: User = {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@dims.local',
    role: Role.ADMIN,
    avatar: 'https://picsum.photos/seed/admin/100/100',
};

export const MOCK_DIRECTORY_USERS: DirectoryUser[] = [
    { id: 'u0', name: 'System Root', email: 'root@dims.local', role: Role.SUPER_ADMIN, avatar: 'https://picsum.photos/seed/root/100/100', title: 'System Super Admin', unit: 'Central IT', isOnline: true },
    { id: 'u1', name: 'Admin User', email: 'admin@dims.local', role: Role.ADMIN, avatar: 'https://picsum.photos/seed/admin/100/100', title: 'Division Administrator', unit: 'Administration', isOnline: true },
    { id: 'u2', name: 'Alice Johnson', email: 'alice.j@dims.local', role: Role.STAFF, avatar: 'https://picsum.photos/seed/alice/100/100', title: 'Senior Staff', unit: 'Operations', isOnline: false },
    { id: 'u3', name: 'Bob Williams', email: 'bob.w@dims.local', role: Role.STAFF, avatar: 'https://picsum.photos/seed/bob/100/100', title: 'Junior Staff', unit: 'Logistics', isOnline: true },
    { id: 'u4', name: 'Dr. Carol White', email: 'carol.w@dims.local', role: Role.FACULTY, avatar: 'https://picsum.photos/seed/carol/100/100', title: 'Professor', unit: 'Academics', isOnline: false },
    { id: 'u5', name: 'David Green', email: 'david.g@dims.local', role: Role.FACULTY, avatar: 'https://picsum.photos/seed/david/100/100', title: 'Stakeholder', unit: 'External Affairs', isOnline: true },
    { id: 'u6', name: 'Eve Black', email: 'eve.b@dims.local', role: Role.STAFF, avatar: 'https://picsum.photos/seed/eve/100/100', title: 'HR Manager', unit: 'Human Resources', isOnline: true },
    { id: 'u7', name: 'Frank Blue', email: 'frank.b@dims.local', role: Role.ADMIN, avatar: 'https://picsum.photos/seed/frank/100/100', title: 'IT Administrator', unit: 'IT Services', isOnline: false },
];

export const MOCK_DOCUMENTS: Document[] = [
    { id: 'd1', name: 'Annual_Report_2023.pdf', type: 'pdf', size: 2048, version: 3, lastModified: new Date('2023-11-10'), uploadedBy: 'Alice Johnson', permissions: [Role.SUPER_ADMIN, Role.ADMIN, Role.FACULTY] },
    { id: 'd2', name: 'Budget_Q4.xlsx', type: 'xlsx', size: 512, version: 1, lastModified: new Date('2023-10-25'), uploadedBy: 'Admin User', permissions: [Role.SUPER_ADMIN, Role.ADMIN] },
    { id: 'd3', name: 'Onboarding_Process.docx', type: 'docx', size: 128, version: 5, lastModified: new Date('2023-12-01'), uploadedBy: 'Eve Black', permissions: [Role.SUPER_ADMIN, Role.ADMIN, Role.STAFF] },
    { id: 'd4', name: 'Campus_Layout.png', type: 'png', size: 4096, version: 1, lastModified: new Date('2023-09-15'), uploadedBy: 'David Green', permissions: [Role.SUPER_ADMIN, Role.ADMIN, Role.STAFF, Role.FACULTY] },
    { id: 'd5', name: 'System_Logs.log', type: 'docx', size: 10240, version: 1, lastModified: new Date('2023-12-06'), uploadedBy: 'System Root', permissions: [Role.SUPER_ADMIN] },
];

export const MOCK_TICKETS: Ticket[] = [
    { id: 't1', title: 'Projector not working in Room 301', submittedBy: 'Dr. Carol White', assignedTo: 'Frank Blue', status: TicketStatus.IN_PROGRESS, priority: TicketPriority.HIGH, createdAt: new Date('2023-12-05'), lastUpdate: new Date('2023-12-05') },
    { id: 't2', title: 'New staff account request', submittedBy: 'Eve Black', status: TicketStatus.OPEN, priority: TicketPriority.MEDIUM, createdAt: new Date('2023-12-04'), lastUpdate: new Date('2023-12-04') },
    { id: 't3', title: 'Website content update', submittedBy: 'David Green', assignedTo: 'Alice Johnson', status: TicketStatus.RESOLVED, priority: TicketPriority.LOW, createdAt: new Date('2023-11-28'), lastUpdate: new Date('2023-12-01') },
    { id: 't4', title: 'Cannot access shared drive', submittedBy: 'Bob Williams', status: TicketStatus.CLOSED, priority: TicketPriority.URGENT, createdAt: new Date('2023-11-20'), lastUpdate: new Date('2023-11-21') },
];

// Helper to create dates relative to now
const daysAgo = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
};

export const MOCK_CIRCULARS: Circular[] = [
    { 
        id: 'a1', 
        title: 'System Maintenance Window', 
        content: 'The DIMS platform will be undergoing scheduled maintenance this Saturday from 10:00 PM to 2:00 AM. Please save your work.', 
        type: 'announcement', 
        priority: 'high',
        publishedBy: 'System Root', 
        publishedAt: daysAgo(0), 
        acknowledgedBy: [], 
        totalRecipients: 0 
    },
    { 
        id: 'c3', 
        title: 'Updated Health Protocols', 
        content: 'Please review the attached guidelines regarding new health safety protocols effective immediately for all on-site personnel.', 
        type: 'circular', 
        priority: 'high',
        publishedBy: 'Admin User', 
        publishedAt: daysAgo(1), 
        acknowledgedBy: [], 
        totalRecipients: 20 
    },
    { 
        id: 'c4', 
        title: 'New IT Security Policy', 
        content: 'A new comprehensive IT security policy has been ratified. All employees are required to review the document and update their passwords accordingly.', 
        type: 'circular', 
        priority: 'high',
        publishedBy: 'Frank Blue', 
        publishedAt: daysAgo(2), 
        acknowledgedBy: ['u2'], 
        totalRecipients: 25 
    },
    { 
        id: 'm1', 
        title: 'Q4 Performance Review Reminder', 
        content: 'Please submit all performance reviews by December 20th. Templates are available in the Documents section.', 
        type: 'memo',
        priority: 'normal',
        publishedBy: 'Eve Black', 
        publishedAt: daysAgo(3), 
        acknowledgedBy: ['u2'], 
        totalRecipients: 7 
    },
    { 
        id: 'c1', 
        title: 'Holiday Schedule Announcement', 
        content: 'The division will be closed from Dec 24th to Jan 2nd. Essential staff will be on rotation.', 
        type: 'circular',
        priority: 'normal',
        publishedBy: 'Admin User', 
        publishedAt: daysAgo(5), 
        acknowledgedBy: ['u2', 'u4', 'u5'], 
        totalRecipients: 7 
    },
    { 
        id: 'a2', 
        title: 'Welcome New Hires', 
        content: 'Please join us in welcoming Sarah and Tom to the logistics team!', 
        type: 'announcement',
        priority: 'normal',
        publishedBy: 'Eve Black', 
        publishedAt: daysAgo(7), 
        acknowledgedBy: [], 
        totalRecipients: 0 
    },
    { 
        id: 'c2', 
        title: 'Mandatory Security Training', 
        content: 'All staff must complete the new security training module by end of the month. Failure to comply will result in account suspension.', 
        type: 'circular',
        priority: 'high',
        publishedBy: 'Frank Blue', 
        publishedAt: daysAgo(10), 
        acknowledgedBy: ['u1', 'u2', 'u3', 'u5', 'u6', 'u7'], 
        totalRecipients: 7 
    },
    { id: 'm2', title: 'Office Supply Request Protocol', content: 'Effective immediately, all supply requests must be routed through the new ERP module.', type: 'memo', priority: 'normal', publishedBy: 'Bob Williams', publishedAt: daysAgo(12), acknowledgedBy: ['u1'], totalRecipients: 10 },
    { id: 'a3', title: 'Cafeteria Menu Update', content: 'We have added vegan and gluten-free options to the daily menu starting next week.', type: 'announcement', priority: 'normal', publishedBy: 'Admin User', publishedAt: daysAgo(13), acknowledgedBy: [], totalRecipients: 0 },
    { id: 'c5', title: 'Fire Drill Schedule', content: 'The annual fire drill is scheduled for next Tuesday at 10:00 AM. Please assemble at the designated points.', type: 'circular', priority: 'high', publishedBy: 'System Root', publishedAt: daysAgo(15), acknowledgedBy: ['u1', 'u2'], totalRecipients: 50 },
    { id: 'm3', title: 'Team Building Event', content: 'Join us for a team building event at the city park on Friday afternoon.', type: 'memo', priority: 'normal', publishedBy: 'Eve Black', publishedAt: daysAgo(16), acknowledgedBy: [], totalRecipients: 15 },
    { id: 'a4', title: 'Server Downtime Alert', content: 'The main file server will be rebooted tonight at 3 AM. Expect brief interruptions.', type: 'announcement', priority: 'high', publishedBy: 'Frank Blue', publishedAt: daysAgo(18), acknowledgedBy: [], totalRecipients: 0 },
    { id: 'c6', title: 'New ID Card Issuance', content: 'All staff are required to obtain their new smart ID cards from the security office by Friday.', type: 'circular', priority: 'normal', publishedBy: 'Admin User', publishedAt: daysAgo(20), acknowledgedBy: ['u1', 'u2', 'u3', 'u4', 'u5'], totalRecipients: 50 },
    { id: 'm4', title: 'Expense Report Guidelines', content: 'Updated guidelines for travel expense reimbursement are now available on the portal.', type: 'memo', priority: 'normal', publishedBy: 'Alice Johnson', publishedAt: daysAgo(22), acknowledgedBy: ['u1'], totalRecipients: 12 },
    { id: 'a5', title: 'Parking Lot Maintenance', content: 'The north parking lot will be resurfaced this weekend. Please park in the south lot.', type: 'announcement', priority: 'normal', publishedBy: 'Bob Williams', publishedAt: daysAgo(25), acknowledgedBy: [], totalRecipients: 0 },
    { id: 'c7', title: 'Annual General Meeting', content: 'The AGM will be held on the 15th of next month. Attendance is mandatory for department heads.', type: 'circular', priority: 'high', publishedBy: 'System Root', publishedAt: daysAgo(28), acknowledgedBy: [], totalRecipients: 8 },
    { id: 'm5', title: 'Project Alpha Kickoff', content: 'The kickoff meeting for Project Alpha is scheduled for Monday at 9 AM in Conference Room B.', type: 'memo', priority: 'high', publishedBy: 'Dr. Carol White', publishedAt: daysAgo(30), acknowledgedBy: ['u1', 'u2'], totalRecipients: 6 },
    { id: 'a6', title: 'Lost and Found', content: 'A set of keys was found in the lobby. Please claim them at the reception.', type: 'announcement', priority: 'normal', publishedBy: 'Admin User', publishedAt: daysAgo(32), acknowledgedBy: [], totalRecipients: 0 },
    { id: 'c8', title: 'Code of Conduct Refresher', content: 'A friendly reminder to review the corporate code of conduct available in the handbook.', type: 'circular', priority: 'normal', publishedBy: 'Eve Black', publishedAt: daysAgo(35), acknowledgedBy: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'], totalRecipients: 50 },
    { id: 'm6', title: 'Software License Renewal', content: 'Please verify your Adobe license status and report to IT if expiration is near.', type: 'memo', priority: 'high', publishedBy: 'Frank Blue', publishedAt: daysAgo(38), acknowledgedBy: [], totalRecipients: 10 },
    { id: 'a7', title: 'Weather Advisory', content: 'Due to heavy snow forecast, the office will close early at 3 PM today.', type: 'announcement', priority: 'high', publishedBy: 'Admin User', publishedAt: daysAgo(40), acknowledgedBy: [], totalRecipients: 0 },
    { id: 'c9', title: 'Data Privacy Workshop', content: 'A workshop on data privacy best practices will be held next Wednesday.', type: 'circular', priority: 'normal', publishedBy: 'Frank Blue', publishedAt: daysAgo(42), acknowledgedBy: [], totalRecipients: 20 },
    { id: 'm7', title: 'Meeting Room Booking System', content: 'We are switching to a new booking system. Please refer to the tutorial sent via email.', type: 'memo', priority: 'normal', publishedBy: 'Alice Johnson', publishedAt: daysAgo(45), acknowledgedBy: ['u1'], totalRecipients: 50 },
    { id: 'a8', title: 'Flu Shot Drive', content: 'Free flu shots will be administered in the clinic this Thursday.', type: 'announcement', priority: 'normal', publishedBy: 'Eve Black', publishedAt: daysAgo(48), acknowledgedBy: [], totalRecipients: 0 },
    { id: 'c10', title: 'Quarterly Town Hall', content: 'Join the leadership team for a quarterly update and Q&A session.', type: 'circular', priority: 'normal', publishedBy: 'System Root', publishedAt: daysAgo(50), acknowledgedBy: ['u1', 'u2', 'u3'], totalRecipients: 50 },
    { id: 'm8', title: 'Work from Home Policy Update', content: 'The WFH policy has been revised to allow 3 days remote per week.', type: 'memo', priority: 'high', publishedBy: 'Eve Black', publishedAt: daysAgo(55), acknowledgedBy: ['u1', 'u2', 'u3', 'u4'], totalRecipients: 50 },
    { id: 'a9', title: 'Recycling Initiative', content: 'New recycling bins have been placed in the break rooms. Please sort your waste.', type: 'announcement', priority: 'normal', publishedBy: 'David Green', publishedAt: daysAgo(60), acknowledgedBy: [], totalRecipients: 0 },
    { id: 'c11', title: 'Payroll Schedule Change', content: 'Payroll will now be processed on the 15th and 30th of each month.', type: 'circular', priority: 'high', publishedBy: 'Admin User', publishedAt: daysAgo(65), acknowledgedBy: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'], totalRecipients: 50 },
    { id: 'm9', title: 'Client Visit Protocol', content: 'Please ensure the meeting rooms are prepped 15 minutes prior to client arrivals.', type: 'memo', priority: 'normal', publishedBy: 'Alice Johnson', publishedAt: daysAgo(70), acknowledgedBy: [], totalRecipients: 10 },
    { id: 'a10', title: 'Elevator Maintenance', content: 'Elevator B will be out of service for repairs tomorrow.', type: 'announcement', priority: 'normal', publishedBy: 'Bob Williams', publishedAt: daysAgo(75), acknowledgedBy: [], totalRecipients: 0 },
    { id: 'c12', title: 'Strategic Planning Session', content: 'Leadership retreat for strategic planning is scheduled for next month.', type: 'circular', priority: 'normal', publishedBy: 'System Root', publishedAt: daysAgo(80), acknowledgedBy: [], totalRecipients: 5 },
    { id: 'm10', title: 'KPI Submission Deadline', content: 'Reminder to submit your KPIs for the next quarter by Friday.', type: 'memo', priority: 'high', publishedBy: 'Eve Black', publishedAt: daysAgo(90), acknowledgedBy: ['u1'], totalRecipients: 50 },
];
