
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, Circular, CommunicationType, Role } from '../types';
import { getCirculars, createCircular, updateCircular } from '../services/mockApi';
import { PdfIcon, DocxIcon, XlsxIcon, PngIcon, DocsIcon } from './icons';

// Helper for relative time
const getRelativeTime = (date: Date) => {
    const now = new Date();
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

interface FormData {
    title: string;
    type: CommunicationType;
    priority: 'high' | 'normal';
    content: string;
    attachments: string[];
}

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
    
    // Create/Edit Modal State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>({
        title: '',
        type: 'announcement',
        priority: 'normal',
        content: '',
        attachments: []
    });
    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Pagination State for New Communications
    const [currentPage, setCurrentPage] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const ITEMS_PER_PAGE = 2;
    
    // Visit Tracking for "New" Badge
    const [lastVisit, setLastVisit] = useState<Date>(new Date(0));

    // Refs for modal scrolling
    const modalContentRef = useRef<HTMLDivElement>(null);

    const isSuperAdmin = currentUser.role === Role.SUPER_ADMIN;
    const canCreate = isSuperAdmin || currentUser.role === Role.ADMIN;

    const fetchCirculars = useCallback(async () => {
        setLoading(true);
        const data = await getCirculars();
        setCirculars(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCirculars();
        const storedDate = localStorage.getItem('dims_last_visit_communications');
        if (storedDate) {
            setLastVisit(new Date(storedDate));
        }
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
            setTimeout(checkScroll, 100);
        }
    }, [selectedItem]);

    const checkScroll = () => {
        if (modalContentRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = modalContentRef.current;
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

    const handleOpenCreate = () => {
        setEditorMode('create');
        setFormData({ title: '', type: 'announcement', priority: 'normal', content: '', attachments: [] });
        setFormErrors([]);
        setIsEditorOpen(true);
    };

    const handleOpenEdit = (circular: Circular) => {
        setEditorMode('edit');
        setEditingId(circular.id);
        setFormData({
            title: circular.title,
            type: circular.type,
            priority: circular.priority,
            content: circular.content,
            attachments: circular.attachments || []
        });
        setFormErrors([]);
        setIsEditorOpen(true);
        // Close the view modal if open
        setSelectedItem(null); 
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const fileName = e.target.files[0].name;
            setFormData(prev => ({ ...prev, attachments: [...prev.attachments, fileName] }));
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeAttachment = (index: number) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const validateForm = (): boolean => {
        const errors: string[] = [];
        if (!formData.title.trim()) errors.push("Title is required.");
        if (!formData.content.trim()) errors.push("Content is required.");
        
        // Attachment validation: Required if type is NOT announcement
        if (formData.type !== 'announcement' && formData.attachments.length === 0) {
            errors.push(`Attachments are required for ${formData.type}s.`);
        }

        setFormErrors(errors);
        return errors.length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsSubmitting(true);

        if (editorMode === 'create') {
            const newCircular: Circular = {
                id: `c${Date.now()}`,
                title: formData.title,
                content: formData.content,
                type: formData.type,
                priority: formData.priority,
                publishedBy: currentUser.name,
                publishedAt: new Date(),
                acknowledgedBy: [],
                totalRecipients: 50, // Mock recipients count
                attachments: formData.attachments,
                history: []
            };
            await createCircular(newCircular);
        } else if (editorMode === 'edit' && editingId) {
            const existing = circulars.find(c => c.id === editingId);
            if (existing) {
                // Calculate changes
                const changes: string[] = [];
                if (existing.title !== formData.title) changes.push("Title");
                if (existing.content !== formData.content) changes.push("Content");
                if (existing.priority !== formData.priority) changes.push("Priority");
                if (existing.type !== formData.type) changes.push("Type");
                if (JSON.stringify(existing.attachments) !== JSON.stringify(formData.attachments)) changes.push("Attachments");
                
                const actionDescription = changes.length > 0 ? `Updated: ${changes.join(', ')}` : "Edited";

                const updated: Circular = {
                    ...existing,
                    title: formData.title,
                    content: formData.content,
                    type: formData.type,
                    priority: formData.priority,
                    attachments: formData.attachments,
                    history: [
                        ...(existing.history || []),
                        {
                            date: new Date(),
                            action: actionDescription,
                            modifiedBy: currentUser.name
                        }
                    ]
                };
                await updateCircular(updated);
            }
        }

        await fetchCirculars();
        setIsSubmitting(false);
        setIsEditorOpen(false);
    };

    // Filter Logic
    const unreadCommunications = useMemo(() => {
        if (isSuperAdmin) return [];
        return circulars
            .filter(c => !c.acknowledgedBy.includes(currentUser.id) && c.publishedBy !== currentUser.name)
            .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    }, [circulars, currentUser.id, currentUser.name, isSuperAdmin]);

    const totalPages = Math.ceil(unreadCommunications.length / ITEMS_PER_PAGE);

    useEffect(() => {
        if (currentPage >= totalPages && totalPages > 0) {
            setCurrentPage(Math.max(0, totalPages - 1));
        } else if (totalPages === 0) {
            setCurrentPage(0);
        }
    }, [unreadCommunications.length, totalPages, currentPage]);

    useEffect(() => {
        if (totalPages <= 1 || isPaused) return;
        const interval = setInterval(() => {
            setCurrentPage((prev) => (prev + 1) % totalPages);
        }, 7000);
        return () => clearInterval(interval);
    }, [totalPages, isPaused]);

    const handleNextPage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (totalPages > 1) setCurrentPage((prev) => (prev + 1) % totalPages);
    };

    const handlePrevPage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (totalPages > 1) setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    };

    const visibleUnreadItems = useMemo(() => {
        const start = currentPage * ITEMS_PER_PAGE;
        return unreadCommunications.slice(start, start + ITEMS_PER_PAGE);
    }, [currentPage, unreadCommunications, ITEMS_PER_PAGE]);

    const filteredList = useMemo(() => {
        let result = circulars;
        if (activeTab !== 'all') result = result.filter(c => c.type === activeTab);
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(c => 
                c.title.toLowerCase().includes(lowerQuery) || 
                c.content.toLowerCase().includes(lowerQuery) ||
                c.publishedBy.toLowerCase().includes(lowerQuery)
            );
        }
        if (statusFilter === 'pending') {
            result = result.filter(c => !c.acknowledgedBy.includes(currentUser.id));
        } else if (statusFilter === 'acknowledged') {
            result = result.filter(c => c.acknowledgedBy.includes(currentUser.id));
        }
        result = [...result].sort((a, b) => {
            const dateA = a.publishedAt.getTime();
            const dateB = b.publishedAt.getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
        return result;
    }, [circulars, activeTab, searchQuery, statusFilter, sortOrder, currentUser.id]);

    const totalArchivePages = Math.ceil(filteredList.length / ARCHIVE_ITEMS_PER_PAGE);
    const paginatedArchiveList = useMemo(() => {
        const start = archivePage * ARCHIVE_ITEMS_PER_PAGE;
        return filteredList.slice(start, start + ARCHIVE_ITEMS_PER_PAGE);
    }, [filteredList, archivePage, ARCHIVE_ITEMS_PER_PAGE]);

    const isNew = (date: Date) => date.getTime() > lastVisit.getTime();
    
    const getBadgeStyle = (type: CommunicationType) => {
        switch (type) {
            case 'circular': return 'bg-blue-50 border-blue-200 text-blue-700';
            case 'memo': return 'bg-purple-50 border-purple-200 text-purple-700';
            default: return 'bg-orange-50 border-orange-200 text-orange-700';
        }
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch(ext) {
            case 'pdf': return <PdfIcon />;
            case 'docx': return <DocxIcon />;
            case 'xlsx': return <XlsxIcon />;
            case 'png': case 'jpg': case 'jpeg': return <PngIcon />;
            default: return <DocsIcon />;
        }
    }

    const hasPending = unreadCommunications.length > 0;

    const renderAttachmentPreview = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(ext || '');
        
        // Mock preview sources based on file name or generic placeholders
        const imageSrc = isImage 
            ? `https://picsum.photos/seed/${fileName}/400/300` 
            : null;

        return (
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex flex-col w-full sm:w-64">
                <div className="h-40 bg-gray-200 flex items-center justify-center overflow-hidden relative">
                    {isImage ? (
                        <img src={imageSrc!} alt={fileName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                            <div className="w-16 h-20 bg-white shadow-md border border-gray-300 mb-2 flex flex-col">
                                <div className="h-2 bg-gray-100 border-b border-gray-200"></div>
                                <div className="flex-1 p-2 space-y-1">
                                    <div className="h-1 bg-gray-200 w-full rounded"></div>
                                    <div className="h-1 bg-gray-200 w-3/4 rounded"></div>
                                    <div className="h-1 bg-gray-200 w-5/6 rounded"></div>
                                </div>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">Page 1 Preview</span>
                        </div>
                    )}
                </div>
                <div className="p-3 bg-white border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="flex-shrink-0 transform scale-75 origin-left">
                            {getFileIcon(fileName)}
                        </div>
                        <span className="text-xs font-medium text-gray-700 truncate">{fileName}</span>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return (
         <div className="space-y-6">
             <div className="h-40 bg-gray-200 rounded-xl animate-pulse"></div>
             <div className="h-64 bg-white rounded-xl animate-pulse shadow-sm"></div>
         </div>
    );

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-10">
            
            {/* Action Required Section */}
            {!isSuperAdmin && (
                hasPending ? (
                    <div 
                        className="bg-gradient-to-br from-[#FFF5F5] to-white rounded-2xl p-6 md:p-8 border border-red-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="flex justify-between items-end mb-6 relative z-10">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Action Required</h2>
                                    <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-20" style={{ animationDuration: '3s' }}></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-primary"></span>
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm max-w-lg">
                                    You have <span className="font-semibold text-gray-900">{unreadCommunications.length} document{unreadCommunications.length !== 1 && 's'}</span> awaiting your review and acknowledgement.
                                </p>
                            </div>
                            
                            {totalPages > 1 && (
                                <div className="flex gap-2">
                                    <button onClick={handlePrevPage} className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 text-gray-400 hover:text-gray-600 transition-all">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button onClick={handleNextPage} className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 text-gray-400 hover:text-gray-600 transition-all">
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
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${getBadgeStyle(item.type)}`}>{item.type}</span>
                                        <span className="text-[10px] font-medium text-gray-400">{getRelativeTime(item.publishedAt)}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-base mb-1.5 leading-snug group-hover:text-brand-primary transition-colors line-clamp-1 flex items-center gap-2">
                                        {item.title}
                                        {isNew(item.publishedAt)}
                                    </h3>
                                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{item.content}</p>
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
                            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-gray-900 font-bold text-lg">You're up to date</h3>
                        <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">No pending circulars or memos require your attention at the moment.</p>
                    </div>
                )
            )}

            {/* Main Document List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-8">
                <div className="border-b border-gray-100 px-6 pt-6 bg-white rounded-t-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                        <h2 className="text-xl font-bold text-brand-dark">Communications Archive</h2>
                        {canCreate && (
                            <button 
                                onClick={handleOpenCreate}
                                className="bg-brand-primary hover:bg-brand-primary-light text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-all text-sm flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                New Communication
                            </button>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap gap-6 mb-4">
                        {['all', 'announcement', 'circular', 'memo'].map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`pb-3 text-sm font-medium transition-colors relative capitalize ${activeTab === tab ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {tab === 'all' ? 'All Documents' : tab}
                                {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-t-full"></span>}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 py-4 border-t border-gray-50 items-center">
                        <div className="relative flex-grow w-full lg:w-auto">
                            <input
                                type="text"
                                placeholder="Search title, content, or author..."
                                className="pl-4 pr-4 py-2.5 w-full text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all shadow-sm bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col">
                    {paginatedArchiveList.map(doc => {
                        const isAck = doc.acknowledgedBy.includes(currentUser.id);
                        const isAuthor = doc.publishedBy === currentUser.name;
                        
                        return (
                            <div key={doc.id} className="p-6 hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-b-0">
                                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                                    <div className="flex-1 cursor-pointer" onClick={() => setSelectedItem(doc)}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${getBadgeStyle(doc.type)}`}>{doc.type}</span>
                                            <span className="text-xs text-gray-500">{doc.publishedAt.toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-brand-primary transition-colors">{doc.title}</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">{doc.content}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">{doc.publishedBy.charAt(0)}</div>
                                            <span className="text-xs text-gray-500">{doc.publishedBy}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 min-w-[140px]">
                                        {isAuthor ? (
                                            <>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    Author
                                                </span>
                                                {/* Edited: "Edit" button removed from archive list for Authors/Admins */}
                                            </>
                                        ) : isSuperAdmin ? (
                                            <span className="text-xs text-gray-400">Admin View</span>
                                        ) : (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedItem(doc); }}
                                                className={`w-full text-xs font-bold px-4 py-2.5 rounded-lg border transition-all shadow-sm flex items-center justify-center gap-2 ${
                                                    isAck 
                                                    ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-brand-primary hover:text-brand-primary'
                                                }`}
                                            >
                                                {isAck ? 'Acknowledged' : 'Read'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Detail Modal - Reverted to Standard Style */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full flex flex-col max-h-[85vh] animate-fade-in-up">
                        {/* Standard Modal Header */}
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-lg">
                             <div>
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase mb-1 tracking-wider ${getBadgeStyle(selectedItem.type)}`}>{selectedItem.type}</span>
                                <h3 className="text-lg font-bold text-gray-800">{selectedItem.title}</h3>
                            </div>
                            <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        {/* Scrollable Body */}
                        <div 
                            className="p-6 overflow-y-auto"
                            ref={modalContentRef}
                            onScroll={checkScroll}
                        >
                             <div className="flex items-center text-sm text-gray-500 mb-6 pb-4 border-b border-gray-100">
                                <span className="font-bold text-gray-700 mr-2">From:</span>
                                <span className="mr-4">{selectedItem.publishedBy}</span>
                                <span className="font-bold text-gray-700 mr-2">Date:</span>
                                <span>{selectedItem.publishedAt.toLocaleDateString()}</span>
                            </div>

                            <div className="prose prose-sm max-w-none text-gray-700 mb-8">
                                <p className="whitespace-pre-wrap leading-relaxed">{selectedItem.content}</p>
                            </div>
                            
                            {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Attachments</h4>
                                    <div className="flex flex-wrap gap-4">
                                        {selectedItem.attachments.map((file, idx) => (
                                            <div key={idx}>
                                                {renderAttachmentPreview(file)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                             {/* Edit History */}
                            {selectedItem.history && selectedItem.history.length > 0 && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Revision History</h4>
                                    <ul className="space-y-2">
                                        {selectedItem.history.map((h, i) => (
                                            <li key={i} className="text-xs text-gray-500 flex flex-col sm:flex-row sm:gap-2">
                                                <span className="font-mono text-gray-400 w-24">{h.date.toLocaleDateString()}</span>
                                                <span className="font-bold text-gray-700">{h.modifiedBy}</span>
                                                <span className="italic">{h.action}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-between items-center rounded-b-lg">
                             {showSuccess ? (
                                <div className="w-full flex justify-center"><span className="text-green-700 font-bold">Successfully Acknowledged</span></div>
                             ) : (
                                 <>
                                    <div className="text-xs text-gray-500">
                                        {(selectedItem.publishedBy === currentUser.name || isSuperAdmin) ? 
                                            "Author/Admin Mode" : (!canAcknowledge && "Scroll to acknowledge")}
                                    </div>
                                    <div className="flex gap-3 ml-auto">
                                        {(selectedItem.publishedBy === currentUser.name || isSuperAdmin) && (
                                            <button 
                                                onClick={() => handleOpenEdit(selectedItem)}
                                                className="px-4 py-2 bg-white border border-brand-primary text-brand-primary font-bold rounded-lg hover:bg-brand-primary hover:text-white transition-colors text-sm"
                                            >
                                                Edit Announcement
                                            </button>
                                        )}
                                        
                                        <button onClick={() => setSelectedItem(null)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 text-sm">Close</button>
                                        
                                        {!(selectedItem.publishedBy === currentUser.name || isSuperAdmin || selectedItem.acknowledgedBy.includes(currentUser.id)) && (
                                            <button 
                                                onClick={() => handleAcknowledge(selectedItem.id)}
                                                disabled={!canAcknowledge}
                                                className={`px-4 py-2 font-bold rounded-lg transition-all text-sm ${canAcknowledge ? 'bg-brand-primary text-white hover:bg-brand-primary-light' : 'bg-gray-200 text-gray-400'}`}
                                            >
                                                Acknowledge
                                            </button>
                                        )}
                                    </div>
                                 </>
                             )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {isEditorOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/90 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">{editorMode === 'create' ? 'Create New Announcement' : 'Edit Announcement'}</h2>
                            <button onClick={() => setIsEditorOpen(false)} className="text-gray-400 hover:text-gray-600"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            
                            {/* Error Display */}
                            {formErrors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
                                    <p className="font-bold mb-1">Please fix the following errors:</p>
                                    <ul className="list-disc list-inside">
                                        {formErrors.map((err, i) => <li key={i}>{err}</li>)}
                                    </ul>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
                                    <select 
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                        value={formData.type}
                                        onChange={e => setFormData({...formData, type: e.target.value as any})}
                                    >
                                        <option value="announcement">Announcement (General Notice)</option>
                                        <option value="circular">Circular</option>
                                        <option value="memo">Memo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Priority <span className="text-red-500">*</span></label>
                                    <select 
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                        value={formData.priority}
                                        onChange={e => setFormData({...formData, priority: e.target.value as any})}
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                                <input 
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    placeholder="Enter subject..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Content <span className="text-red-500">*</span></label>
                                <textarea 
                                    rows={6}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                    value={formData.content}
                                    onChange={e => setFormData({...formData, content: e.target.value})}
                                    placeholder="Type your message here..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Attachments {formData.type !== 'announcement' && <span className="text-red-500">*</span>}
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {formData.attachments.map((file, i) => (
                                        <div key={i} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700">
                                            <span className="truncate max-w-[150px]">{file}</span>
                                            <button type="button" onClick={() => removeAttachment(i)} className="ml-2 text-gray-400 hover:text-red-500">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.type !== 'announcement' ? 'Required for Circulars and Memos.' : 'Optional for General Notices.'}
                                </p>
                            </div>
                        </form>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setIsEditorOpen(false)} className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button 
                                onClick={handleSubmit} 
                                disabled={isSubmitting}
                                className="px-8 py-2.5 bg-brand-primary text-white rounded-xl font-bold shadow-lg hover:bg-brand-primary-light flex items-center"
                            >
                                {isSubmitting && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                {editorMode === 'create' ? 'Publish' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Circulars;
