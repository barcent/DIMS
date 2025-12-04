
import React, { useState, useMemo } from 'react';
import { DirectoryUser, Role } from '../types';

interface DirectoryProps {
    users: DirectoryUser[];
}

const Directory: React.FC<DirectoryProps> = ({ users }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<Role | 'All'>('All');

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.unit.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = filterRole === 'All' || user.role === filterRole;
            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, filterRole]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-brand-dark mb-4">People & Units Directory</h2>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by name, email, or unit..."
                    className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-accent focus:outline-none"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <select
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-accent focus:outline-none"
                    value={filterRole}
                    onChange={e => setFilterRole(e.target.value as Role | 'All')}
                >
                    <option value="All">All Roles</option>
                    <option value={Role.ADMIN}>Admin</option>
                    <option value={Role.STAFF}>Staff</option>
                    <option value={Role.FACULTY}>Faculty</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Name</th>
                            <th className="p-4 font-semibold text-gray-600 hidden md:table-cell">Title</th>
                            <th className="p-4 font-semibold text-gray-600 hidden lg:table-cell">Unit</th>
                            <th className="p-4 font-semibold text-gray-600">Role</th>
                            <th className="p-4 font-semibold text-gray-600">Contact</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 flex items-center">
                                    <div className="relative">
                                        <img src={user.avatar} alt={user.name} className="w-11 h-11 rounded-full mr-4" />
                                        <span className={`absolute bottom-0 right-4 block h-3 w-3 rounded-full ring-2 ring-white ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}>
                                            {user.isOnline && <span className="animate-pulse-fast absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-brand-dark">{user.name}</p>
                                        <p className="text-sm text-gray-500 md:hidden">{user.title}</p>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-700 hidden md:table-cell">{user.title}</td>
                                <td className="p-4 text-gray-700 hidden lg:table-cell">{user.unit}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        user.role === Role.ADMIN ? 'bg-red-100 text-red-800' :
                                        user.role === Role.STAFF ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-brand-primary hover:underline">
                                    <a href={`mailto:${user.email}`}>{user.email}</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredUsers.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <p>No users found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Directory;
