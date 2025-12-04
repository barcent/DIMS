
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Ticket, TicketStatus, TicketPriority, Role } from '../types';
import { getTickets } from '../services/mockApi';

const TicketStatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full inline-block";
    const statusMap = {
        [TicketStatus.OPEN]: "bg-blue-100 text-blue-800",
        [TicketStatus.IN_PROGRESS]: "bg-yellow-100 text-yellow-800",
        [TicketStatus.RESOLVED]: "bg-green-100 text-green-800",
        [TicketStatus.CLOSED]: "bg-gray-200 text-gray-800",
    };
    return <span className={`${baseClasses} ${statusMap[status]}`}>{status}</span>;
};

const TicketPriorityBadge: React.FC<{ priority: TicketPriority }> = ({ priority }) => {
     const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full inline-block";
    const priorityMap = {
        [TicketPriority.LOW]: "bg-gray-100 text-gray-800",
        [TicketPriority.MEDIUM]: "bg-indigo-100 text-indigo-800",
        [TicketPriority.HIGH]: "bg-orange-100 text-orange-800",
        [TicketPriority.URGENT]: "bg-red-100 text-red-800",
    };
    return <span className={`${baseClasses} ${priorityMap[priority]}`}>{priority}</span>;
}

const Tickets: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<TicketStatus | 'All'>('All');

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        const data = await getTickets();
        setTickets(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);
    
    const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
        setTickets(prev => prev.map(t => t.id === ticketId ? {...t, status: newStatus, lastUpdate: new Date()} : t));
    };

    const filteredTickets = useMemo(() => {
        if (filterStatus === 'All') return tickets;
        return tickets.filter(t => t.status === filterStatus);
    }, [tickets, filterStatus]);
    
    const isAdmin = currentUser.role === Role.ADMIN;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-brand-dark">Service Requests</h2>
                    <p className="text-gray-600 mt-1">Track and manage service requests and issues.</p>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-accent focus:outline-none"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as TicketStatus | 'All')}
                    >
                        <option value="All">All Statuses</option>
                        {Object.values(TicketStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="bg-brand-primary text-white font-bold py-2 px-4 rounded-md hover:bg-brand-accent transition-colors">
                        New Ticket
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Ticket Details</th>
                            <th className="p-4 font-semibold text-gray-600 hidden md:table-cell">Submitted By</th>
                            <th className="p-4 font-semibold text-gray-600 hidden lg:table-cell">Last Update</th>
                            <th className="p-4 font-semibold text-gray-600">Priority</th>
                            <th className="p-4 font-semibold text-gray-600">Status</th>
                            {isAdmin && <th className="p-4 font-semibold text-gray-600">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                             Array.from({length: 4}).map((_, i) => (
                                <tr key={i}><td colSpan={isAdmin ? 6 : 5}><div className="h-16 bg-gray-200 rounded animate-pulse my-2"></div></td></tr>
                            ))
                        ) : filteredTickets.map(ticket => (
                            <tr key={ticket.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                    <p className="font-semibold text-brand-dark">{ticket.title}</p>
                                    <p className="text-sm text-gray-500">ID: {ticket.id}</p>
                                </td>
                                <td className="p-4 text-gray-700 hidden md:table-cell">{ticket.submittedBy}</td>
                                <td className="p-4 text-gray-700 hidden lg:table-cell">{ticket.lastUpdate.toLocaleDateString()}</td>
                                <td className="p-4"><TicketPriorityBadge priority={ticket.priority} /></td>
                                <td className="p-4"><TicketStatusBadge status={ticket.status} /></td>
                                {isAdmin && (
                                    <td className="p-4">
                                        <select
                                            value={ticket.status}
                                            onChange={(e) => handleStatusChange(ticket.id, e.target.value as TicketStatus)}
                                            className="p-1 border border-gray-300 rounded-md text-sm"
                                        >
                                             {Object.values(TicketStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredTickets.length === 0 && !loading && (
                    <div className="text-center py-10 text-gray-500">
                        <p>No tickets found with the selected status.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tickets;
