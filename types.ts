
export enum Role {
    SUPER_ADMIN = 'Super Admin',
    ADMIN = 'Division Admin',
    STAFF = 'Staff',
    FACULTY = 'Faculty',
}

export enum View {
    DASHBOARD = 'Dashboard',
    DIRECTORY = 'Directory',
    DOCUMENTS = 'Documents',
    CIRCULARS = 'Circulars',
    TICKETS = 'Tickets',
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatar: string;
}

export interface DirectoryUser extends User {
    title: string;
    unit: string;
    isOnline: boolean;
}

export interface Document {
    id: string;
    name: string;
    type: 'pdf' | 'docx' | 'xlsx' | 'png';
    size: number; // in KB
    version: number;
    lastModified: Date;
    uploadedBy: string;
    permissions: Role[];
}

export enum TicketStatus {
    OPEN = 'Open',
    IN_PROGRESS = 'In Progress',
    RESOLVED = 'Resolved',
    CLOSED = 'Closed',
}

export enum TicketPriority {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
    URGENT = 'Urgent',
}

export interface Ticket {
    id: string;
    title: string;
    submittedBy: string;
    assignedTo?: string;
    status: TicketStatus;
    priority: TicketPriority;
    createdAt: Date;
    lastUpdate: Date;
}

export type CommunicationType = 'announcement' | 'circular' | 'memo';

export interface CircularHistory {
    date: Date;
    action: string;
    modifiedBy: string;
}

export interface Circular {
    id: string;
    title: string;
    content: string;
    type: CommunicationType;
    priority: 'high' | 'normal';
    publishedBy: string;
    publishedAt: Date;
    acknowledgedBy: string[]; // List of user IDs who have acknowledged
    totalRecipients: number;
    attachments?: string[];
    history?: CircularHistory[];
    // Routing Logic
    targetRoles: Role[]; // E.g., [Role.STAFF, Role.FACULTY]
    targetUserIds: string[]; // Specific users: ['u2', 'u5']
}
