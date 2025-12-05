
import { Document, Ticket, Circular, DirectoryUser } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export const getDashboardAnalytics = (): Promise<any> => {
  return fetch(`${API_BASE_URL}/dashboard-analytics`).then(res => res.json());
};

export const getRecentActivity = (): Promise<any[]> => {
    return fetch(`${API_BASE_URL}/recent-activity`).then(res => res.json());
};

export const getDocuments = (): Promise<Document[]> => {
    return fetch(`${API_BASE_URL}/documents`).then(res => res.json());
};

export const getTickets = (): Promise<Ticket[]> => {
    return fetch(`${API_BASE_URL}/tickets`).then(res => res.json());
};

export const getCirculars = (): Promise<Circular[]> => {
    return fetch(`${API_BASE_URL}/circulars`).then(res => res.json());
};

export const createCircular = (circular: Circular): Promise<Circular> => {
    return fetch(`${API_BASE_URL}/circulars`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(circular),
    }).then(res => res.json());
};

export const updateCircular = (updatedCircular: Circular): Promise<Circular> => {
    return fetch(`${API_BASE_URL}/circulars/${updatedCircular.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCircular),
    }).then(res => res.json());
};

export const getDirectoryUsers = (): Promise<DirectoryUser[]> => {
    return fetch(`${API_BASE_URL}/directory-users`).then(res => res.json());
};
