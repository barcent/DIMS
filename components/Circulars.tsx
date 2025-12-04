
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, Circular, CommunicationType } from '../types';
import { getCirculars } from '../services/mockApi';

// Helper for relative time
const getRelativeTime = (date: Date) => {
    const now = new Date();
    // Use Math.abs to handle potential time skew in mocks, though usually past
    const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
    
    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'week', seconds: 604800 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
        { label: 'second', seconds: 1 }
    ];

    for (const interval of intervals) {
        const count = Math.floor(diffInSeconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
        }
    }
    return 'Just now';
};

// Helper for simulated acknowledgment date
const getMockAckDate = (publishedDate: Date) => {
    const date = new Date(publishedDate);
    // Simulate a realistic delay for the demo (e.g., 4 hours and 15 mins after publication)
    date.setHours(date.getHours() + 4);
    date.setMinutes(date.getMinutes() + 15);
    return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
};

const Circulars: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [circulars, setCirculars] = useState<Circular[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'announcement' | 'circular' | 'memo'>('all');
    
    // Archive Filters & Sort State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'acknowledged'>('all');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    // Archive Pagination State
    const [archivePage, setArchivePage] = useState(0);
    const ARCHIVE_ITEMS_PER_PAGE = 10;

    // Modal State
    const [selectedItem, setSelectedItem] = useState<Circular | null>(null);
    const [canAcknowledge, setCanAcknowledge] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    
    // Pagination State for New Communications
    const [currentPage, setCurrentPage] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const ITEMS_PER_PAGE = 2;
    
    // Visit Tracking for "New" Badge
    const [lastVisit, setLastVisit] = useState<Date>(new Date(0));

    // Refs for modal scrolling
    const modalContentRef = useRef<HTMLDivElement>(null);

    const fetchCirculars = useCallback(async () => {
        setLoading(true);
        const data = await getCirculars();
        setCirculars(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCirculars();
        
        // Handle "Last Visit" logic
        const storedDate = localStorage.getItem('dims_last_visit_communications');
        if (storedDate) {
            setLastVisit(new Date(storedDate));
        }
        // Update visit time for next session immediately
        localStorage.setItem('dims_last_visit_communications', new Date().toISOString());
    }, [fetchCirculars]);

    // Reset Archive Page when filters change
    useEffect(() => {
        setArchivePage(0);
    }, [activeTab, searchQuery, statusFilter, sortOrder]);

    // Modal Scroll Logic
    useEffect(() => {
        if (selectedItem) {
            setCanAcknowledge(false);
            setShowSuccess(false);
            // Check immediately in case content is short
            setTimeout(checkScroll, 100);
        }
    }, [selectedItem]);

    const checkScroll = () => {
        if (modalContentRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = modalContentRef.current;
            // 5px threshold
            if (scrollHeight <= clientHeight + 5 || Math.ceil(scrollTop + clientHeight) >= scrollHeight - 5) {
                setCanAcknowledge(true);
            }
        }
    };

    const handleAcknowledge = (circularId: string) => {
        setCirculars(prevCirculars =>
            prevCirculars.map(c => {
                if (c.id === circularId && !c.acknowledgedBy.includes(currentUser.id)) {
                    return { ...c, acknowledgedBy: [...c.acknowledgedBy, currentUser.id] };
                }
                return c;
            })
        );
        setShowSuccess(true);
        setTimeout(() => {
            setSelectedItem(null);
            setShowSuccess(false);
        }, 850);
    };

    // Derived Lists
    // Top Section: All unread communications regardless of type
    const unreadCommunications = useMemo(() => {
        return circulars
            .filter(c => !c.acknowledgedBy.includes(currentUser.id))
            .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    }, [circulars, currentUser.id]);

    // Pagination Logic Calculations
    const totalPages = Math.ceil(unreadCommunications.length / ITEMS_PER_PAGE);

    // Effect to reset page if the current page becomes invalid (e.g. user acknowledged items)
    useEffect(() => {
        if (currentPage >= totalPages && totalPages > 0) {
            setCurrentPage(Math.max(0, totalPages - 1));
        } else if (totalPages === 0) {
            setCurrentPage(0);
        }
    }, [unreadCommunications.length, totalPages, currentPage]);

    // Effect to auto-rotate pages
    useEffect(() => {
        if (totalPages <= 1 || isPaused) return;

        const interval = setInterval(() => {
            setCurrentPage((prev) => (prev + 1) % totalPages);
        }, 5000); // Rotate every 5 seconds

        return () => clearInterval(interval);
    }, [totalPages, isPaused]);

    // Manual Pagination Handlers
    const handleNextPage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (totalPages > 1) {
            setCurrentPage((prev) => (prev + 1) % totalPages);
        }
    };

    const handlePrevPage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (totalPages > 1) {
            setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
        }
    };

    // Get current visible items
    const visibleUnreadItems = useMemo(() => {
        const start = currentPage * ITEMS_PER_PAGE;
        return unreadCommunications.slice(start, start + ITEMS_PER_PAGE);
    }, [currentPage, unreadCommunications, ITEMS_PER_PAGE]);


    // Archive List with Advanced Filtering
    const filteredList = useMemo(() => {
        let result = circulars;

        // 1. Tab Filter
        if (activeTab !== 'all') {
            result = result.filter(c => c.type === activeTab);
        }

        // 2. Search Query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(c => 
                c.title.toLowerCase().includes(lowerQuery) || 
                c.content.toLowerCase().includes(lowerQuery) ||
                c.publishedBy.toLowerCase().includes(lowerQuery)
            );
        }

        // 3. Status Filter
        if (statusFilter === 'pending') {
            result = result.filter(c => !c.acknowledgedBy.includes(currentUser.id));
        } else if (statusFilter === 'acknowledged') {
            result = result.filter(c => c.acknowledgedBy.includes(currentUser.id));
        }

        // 4. Sorting
        result = [...result].sort((a, b) => {
            const dateA = a.publishedAt.getTime();
            const dateB = b.publishedAt.getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [circulars, activeTab, searchQuery, statusFilter, sortOrder, currentUser.id]);

    // Pagination for Archive List
    const totalArchivePages = Math.ceil(filteredList.length / ARCHIVE_ITEMS_PER_PAGE);
    const paginatedArchiveList = useMemo(() => {
        const start = archivePage * ARCHIVE_ITEMS_PER_PAGE;
        return filteredList.slice(start, start + ARCHIVE_ITEMS_PER_PAGE);
    }, [filteredList, archivePage, ARCHIVE_ITEMS_PER_PAGE]);


    const isNew = (date: Date) => {
        return date.getTime() > lastVisit.getTime();
    };

    const getBadgeStyle = (type: CommunicationType) => {
        switch (type) {
            case 'circular': return 'bg-blue-50 border-blue-200 text-blue-700';
            case 'memo': return 'bg-purple-50 border-purple-200 text-purple-700';
            default: return 'bg-orange-50 border-orange-200 text-orange-700'; // Announcement and others
        }
    };

    const hasPending = unreadCommunications.length > 0;

    if (loading) {
        return (
             <div className="space-y-6">
                 <div className="h-40 bg-gray-200 rounded-xl animate-pulse"></div>
                 <div className="h-64 bg-white rounded-xl animate-pulse shadow-sm"></div>
             </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-10">
            
            {/* 1. Pending Acknowledgements Section - REDESIGNED */}
            {hasPending ? (
                <div 
                    className="bg-gradient-to-br from-[#FFF5F5] to-white rounded-2xl p-6 md:p-8 border border-red-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex justify-between items-end mb-6 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Action Required</h2>
                                {/* Subtle Pulsating Dot */}
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-20" style={{ animationDuration: '3s' }}></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-primary"></span>
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm max-w-lg">
                                You have <span className="font-semibold text-gray-900">{unreadCommunications.length} document{unreadCommunications.length !== 1 && 's'}</span> awaiting your review and acknowledgement.
                            </p>
                        </div>
                        
                        {/* Pagination Controls (Mini) */}
                        {totalPages > 1 && (
                            <div className="flex gap-2">
                                <button 
                                    onClick={handlePrevPage}
                                    className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 text-gray-400 hover:text-gray-600 transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button 
                                    onClick={handleNextPage}
                                    className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 text-gray-400 hover:text-gray-600 transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 relative z-10">
                        {visibleUnreadItems.map(item => (
                            <div 
                                key={item.id} 
                                onClick={() => setSelectedItem(item)}
                                className="group bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-primary/30 transition-all duration-300 cursor-pointer flex flex-col h-full animate-fade-in-up"
                            >
                                <div className="flex justify-between items-center mb-2">
                                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${getBadgeStyle(item.type)}`}>
                                        {item.type}
                                    </span>
                                    <span className="text-[10px] font-medium text-gray-400">
                                        {getRelativeTime(item.publishedAt)}
                                    </span>
                                </div>
                                
                                <h3 className="font-bold text-gray-800 text-base mb-1.5 leading-snug group-hover:text-brand-primary transition-colors line-clamp-1 flex items-center gap-2">
                                    {item.title}
                                    {isNew(item.publishedAt) && (
                                        <span className="relative flex h-2 w-2">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                        </span>
                                    )}
                                </h3>
                                
                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
                                    {item.content}
                                </p>
                                
                                <div className="mt-auto flex items-center justify-end border-t border-gray-50 pt-2">
                                    <span className="text-[11px] font-bold text-brand-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        Review Details
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl p-8 border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-gray-900 font-bold text-lg">You're up to date</h3>
                    <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
                        No pending circulars or memos require your attention at the moment. Check back later for updates.
                    </p>
                </div>
            )}

            {/* 2. Main Document List with Tabs & Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-8">
                {/* Header Area */}
                <div className="border-b border-gray-100 px-6 pt-6 bg-white rounded-t-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                        <h2 className="text-xl font-bold text-brand-dark">Communications Archive</h2>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex flex-wrap gap-6 mb-4">
                        <button 
                            onClick={() => setActiveTab('all')}
                            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'all' ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            All Documents
                            {activeTab === 'all' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-t-full"></span>}
                        </button>
                        <button 
                            onClick={() => setActiveTab('announcement')}
                            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'announcement' ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            General Notices
                            {activeTab === 'announcement' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-t-full"></span>}
                        </button>
                        <button 
                            onClick={() => setActiveTab('circular')}
                            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'circular' ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Circulars
                            {activeTab === 'circular' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-t-full"></span>}
                        </button>
                        <button 
                            onClick={() => setActiveTab('memo')}
                            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'memo' ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Memos
                            {activeTab === 'memo' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-t-full"></span>}
                        </button>
                    </div>

                    {/* Filter Toolbar */}
                    <div className="flex flex-col lg:flex-row gap-4 py-4 border-t border-gray-50 items-center">
                        {/* Search */}
                        <div className="relative flex-grow w-full lg:w-auto">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search title, content, or author..."
                                className="pl-10 pr-4 py-2.5 w-full text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all shadow-sm bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4 w-full lg:w-auto">
                             {/* Status Filter */}
                             <div className="relative w-full sm:w-auto">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                </div>
                                <select
                                    className="pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none appearance-none shadow-sm w-full sm:w-48 cursor-pointer font-medium text-gray-700 transition-all hover:border-gray-300"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                >
                                    <option value="all">Status: All</option>
                                    <option value="pending">Status: Unread</option>
                                    <option value="acknowledged">Status: Acknowledged</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                             </div>

                            {/* Sort */}
                             <div className="relative w-full sm:w-auto">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                </div>
                                <select
                                    className="pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none appearance-none shadow-sm w-full sm:w-44 cursor-pointer font-medium text-gray-700 transition-all hover:border-gray-300"
                                    value={sortOrder}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                >
                                    <option value="newest">Sort: Newest</option>
                                    <option value="oldest">Sort: Oldest</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col">
                    {paginatedArchiveList.map(doc => {
                        const isAck = doc.acknowledgedBy.includes(currentUser.id);
                        return (
                            <div key={doc.id} className="p-6 hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-b-0">
                                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                                    {/* Make the text content area clickable */}
                                    <div 
                                        className="flex-1 cursor-pointer" 
                                        onClick={() => setSelectedItem(doc)}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${getBadgeStyle(doc.type)}`}>
                                                {doc.type}
                                            </span>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-500">{doc.publishedAt.toLocaleDateString()}</span>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-500">{getRelativeTime(doc.publishedAt)}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-brand-primary transition-colors">{doc.title}</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed mb-3">{doc.content}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                                {doc.publishedBy.charAt(0)}
                                            </div>
                                            <span className="text-xs text-gray-500">{doc.publishedBy}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 min-w-[140px]">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent double trigger if parent is clicked
                                                setSelectedItem(doc);
                                            }}
                                            className={`w-full text-xs font-bold px-4 py-2.5 rounded-lg border transition-all shadow-sm flex items-center justify-center gap-2 ${
                                                isAck 
                                                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-brand-primary hover:text-brand-primary'
                                            }`}
                                        >
                                            {isAck ? (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Acknowledged
                                                </>
                                            ) : 'Read'}
                                        </button>
                                        {doc.type !== 'announcement' && (
                                            <div className="text-[10px] text-gray-400 mt-1">
                                                Status: {doc.acknowledgedBy.length} / {doc.totalRecipients} Read
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {filteredList.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            <div className="inline-block p-4 bg-gray-100 rounded-full mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <p className="font-medium text-gray-800">No documents found</p>
                            <p className="text-sm mt-1">Try adjusting your filters or search terms.</p>
                        </div>
                    )}
                </div>

                {/* Archive Pagination Controls */}
                {totalArchivePages > 1 && (
                    <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                        <button
                            onClick={() => setArchivePage(p => Math.max(0, p - 1))}
                            disabled={archivePage === 0}
                            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                                archivePage === 0
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-brand-primary'
                            }`}
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600 font-medium">
                            Page {archivePage + 1} of {totalArchivePages}
                        </span>
                        <button
                            onClick={() => setArchivePage(p => Math.min(totalArchivePages - 1, p + 1))}
                            disabled={archivePage === totalArchivePages - 1}
                            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                                archivePage === totalArchivePages - 1
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-brand-primary'
                            }`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[85vh] animate-fade-in-up">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                            <div>
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase mb-2 tracking-wider ${getBadgeStyle(selectedItem.type)}`}>
                                    {selectedItem.type}
                                </span>
                                <h2 className="text-2xl font-bold text-gray-800 leading-tight">{selectedItem.title}</h2>
                            </div>
                            <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-brand-primary transition-colors p-1 bg-white border border-gray-200 rounded-full hover:bg-gray-50 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div 
                            className="p-8 overflow-y-auto leading-relaxed text-gray-600 space-y-4 scroll-smooth"
                            ref={modalContentRef}
                            onScroll={checkScroll}
                        >
                            <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 gap-2">
                                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                                    <span className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                        {selectedItem.publishedBy.charAt(0)}
                                    </span>
                                    <span className="font-medium text-gray-900">{selectedItem.publishedBy}</span>
                                </div>
                                <span className="hidden sm:inline text-gray-300">|</span>
                                <span>{selectedItem.publishedAt.toLocaleDateString()}</span>
                                <span className="hidden sm:inline text-gray-300">|</span>
                                <span>{selectedItem.publishedAt.toLocaleTimeString()}</span>
                            </div>

                            <p className="text-lg text-gray-800 font-medium">{selectedItem.content}</p>
                            <p>To ensure all staff are aligned with the new directive, please read the following details carefully. This document serves as an official communication channel for the division.</p>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                            <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
                            <p>Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.</p>
                            
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center rounded-b-2xl min-h-[88px]">
                             {showSuccess ? (
                                <div className="w-full flex flex-col items-center justify-center animate-fade-in-up">
                                    <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="font-bold">Successfully Acknowledged</span>
                                    </div>
                                </div>
                             ) : selectedItem.acknowledgedBy.includes(currentUser.id) ? (
                                 <div className="w-full flex justify-center animate-fade-in-up">
                                     <div className="flex flex-col items-center gap-1">
                                        <div className="inline-flex items-center gap-2 text-green-700 bg-green-100/50 border border-green-200 px-5 py-2.5 rounded-xl shadow-sm">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span className="font-bold">Acknowledged</span>
                                        </div>
                                        <span className="text-xs text-gray-500 font-medium">
                                            Confirmed on {getMockAckDate(selectedItem.publishedAt)}
                                        </span>
                                     </div>
                                 </div>
                             ) : (
                                 <>
                                     <div className="text-xs text-gray-500 hidden sm:block">
                                        {!canAcknowledge && "Please scroll to the end to acknowledge."}
                                     </div>
                                     <div className="flex gap-3 ml-auto">
                                        <button 
                                            onClick={() => setSelectedItem(null)}
                                            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                                        >
                                            Close
                                        </button>
                                        <button 
                                            onClick={() => {
                                                handleAcknowledge(selectedItem.id);
                                            }}
                                            disabled={!canAcknowledge}
                                            className={`px-6 py-2 font-bold rounded-lg transition-all shadow-lg transform ${
                                                canAcknowledge 
                                                ? 'bg-brand-primary text-white hover:bg-brand-primary-light hover:shadow-xl hover:-translate-y-0.5' 
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                            }`}
                                        >
                                            {canAcknowledge ? 'Acknowledge' : 'Read to Acknowledge'}
                                        </button>
                                     </div>
                                 </>
                             )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Circulars;
