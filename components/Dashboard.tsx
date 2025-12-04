
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getDashboardAnalytics, getRecentActivity } from '../services/mockApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    loading: boolean;
    colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, loading, colorClass }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-24 h-24 ${colorClass} opacity-5 rounded-bl-full transition-transform group-hover:scale-110 duration-500`}></div>
        <div className="flex items-center justify-between relative z-10">
            <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
                {loading ? (
                    <div className="h-8 w-16 bg-gray-100 rounded animate-pulse mt-2"></div>
                ) : (
                    <p className="text-3xl font-bold text-brand-dark mt-1">{value}</p>
                )}
            </div>
            <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-brand-dark`}>
                <div className="text-opacity-80">
                   {icon}
                </div>
            </div>
        </div>
    </div>
);


const Dashboard: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [analytics, setAnalytics] = useState<any>(null);
    const [activity, setActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [analyticsData, activityData] = await Promise.all([
                getDashboardAnalytics(),
                getRecentActivity()
            ]);
            setAnalytics(analyticsData);
            setActivity(activityData);
            setLoading(false);
        };
        fetchData();
    }, []);

    const COLORS = ['#8B1E22', '#0E4D2C', '#FFC425', '#64748B']; // Updated Palette

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-brand-dark">Dashboard</h2>
                    <p className="text-gray-500 mt-1">Overview of system performance and activities.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 text-sm text-gray-500 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    System Status: Operational
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Active Tickets" 
                    value={analytics?.activeTickets} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>} 
                    loading={loading}
                    colorClass="bg-blue-600"
                />
                <StatCard 
                    title="Pending Circulars" 
                    value={analytics?.pendingCirculars} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.148-6.136a1.76 1.76 0 011.164-2.315l5.524-1.918a1.76 1.76 0 012.315 1.164l2.148 6.136A1.76 1.76 0 0117.24 19.24V5.882" /></svg>} 
                    loading={loading}
                    colorClass="bg-brand-accent"
                />
                <StatCard 
                    title="Online Users" 
                    value={analytics?.onlineUsers} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} 
                    loading={loading}
                    colorClass="bg-green-600"
                />
                 <StatCard 
                    title="Total Documents" 
                    value={analytics?.documentTypeData?.reduce((sum: number, type: { value: number }) => sum + type.value, 0)} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>} 
                    loading={loading} 
                    colorClass="bg-brand-primary"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg text-brand-dark mb-6">Ticket Status Overview</h3>
                    {loading ? <div className="h-64 bg-gray-100 rounded animate-pulse"></div> : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics?.ticketStatusData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                                <Tooltip 
                                    cursor={{fill: '#F8FAFC'}}
                                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                                />
                                <Bar dataKey="value" fill="#8B1E22" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg text-brand-dark mb-6">Document Distribution</h3>
                     {loading ? <div className="h-64 bg-gray-100 rounded animate-pulse"></div> : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie 
                                    data={analytics?.documentTypeData} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={60} 
                                    outerRadius={90} 
                                    paddingAngle={5}
                                >
                                {analytics?.documentTypeData.map((entry:any, index:number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                ))}
                                </Pie>
                                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-lg text-brand-dark mb-4">Recent Activity Feed</h3>
                 <div className="space-y-4">
                     {loading ? (
                         Array.from({length: 4}).map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded animate-pulse"></div>)
                     ) : (
                         activity.map((item, index) => (
                            <div key={index} className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors border-l-2 border-transparent hover:border-brand-primary">
                                <div className="w-10 h-10 rounded-full bg-brand-light text-brand-primary flex items-center justify-center font-bold mr-4 border border-gray-200">
                                    {item.user.substring(0, 1)}
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm text-gray-800"><span className="font-semibold text-brand-dark">{item.user}</span> {item.action} <span className="text-brand-primary font-medium">{item.subject}</span>.</p>
                                </div>
                                <p className="text-xs font-medium text-gray-400">{item.time}</p>
                            </div>
                        ))
                     )}
                 </div>
            </div>

        </div>
    );
};

export default Dashboard;
