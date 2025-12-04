
import { MOCK_DOCUMENTS, MOCK_TICKETS, MOCK_CIRCULARS, MOCK_DIRECTORY_USERS } from '../constants';
import { Document, Ticket, Circular, DirectoryUser } from '../types';

// DCN Justification: This mock API simulates a client-server architecture over a network.
// The `setTimeout` function is used to introduce artificial latency, mimicking the time
// it takes for a request to travel to a server and for the response to return. This helps
// in developing UIs that are resilient to network delays, using loading states.

const NETWORK_LATENCY = 500; // 500ms delay

export const getDashboardAnalytics = (): Promise<any> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        activeTickets: MOCK_TICKETS.filter(t => t.status === 'Open' || t.status === 'In Progress').length,
        documentsInReview: 5,
        pendingCirculars: MOCK_CIRCULARS.filter(c => c.acknowledgedBy.length < c.totalRecipients).length,
        onlineUsers: MOCK_DIRECTORY_USERS.filter(u => u.isOnline).length,
        ticketStatusData: [
            { name: 'Open', value: MOCK_TICKETS.filter(t => t.status === 'Open').length },
            { name: 'In Progress', value: MOCK_TICKETS.filter(t => t.status === 'In Progress').length },
            { name: 'Resolved', value: MOCK_TICKETS.filter(t => t.status === 'Resolved').length },
        ],
        documentTypeData: [
            { name: 'PDF', value: MOCK_DOCUMENTS.filter(d => d.type === 'pdf').length },
            { name: 'DOCX', value: MOCK_DOCUMENTS.filter(d => d.type === 'docx').length },
            { name: 'XLSX', value: MOCK_DOCUMENTS.filter(d => d.type === 'xlsx').length },
            { name: 'PNG', value: MOCK_DOCUMENTS.filter(d => d.type === 'png').length },
        ]
      });
    }, NETWORK_LATENCY);
  });
};

export const getRecentActivity = (): Promise<any[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { user: 'Alice Johnson', action: 'uploaded a new document', subject: 'Annual_Report_2023.pdf', time: '2h ago' },
                { user: 'Dr. Carol White', action: 'submitted a new ticket', subject: 'Projector not working...', time: '5h ago' },
                { user: 'Admin User', action: 'published a new circular', subject: 'Holiday Schedule', time: '1d ago' },
                { user: 'Frank Blue', action: 'resolved a ticket', subject: 'Cannot access shared drive', time: '2d ago' },
            ]);
        }, NETWORK_LATENCY + 200);
    });
};

export const getDocuments = (): Promise<Document[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(MOCK_DOCUMENTS), NETWORK_LATENCY);
    });
};

export const getTickets = (): Promise<Ticket[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(MOCK_TICKETS), NETWORK_LATENCY);
    });
};

export const getCirculars = (): Promise<Circular[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(MOCK_CIRCULARS), NETWORK_LATENCY);
    });
};

export const getDirectoryUsers = (): Promise<DirectoryUser[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(MOCK_DIRECTORY_USERS), NETWORK_LATENCY);
    });
};
