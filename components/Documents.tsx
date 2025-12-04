import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Document, Role } from '../types';
import { getDocuments } from '../services/mockApi';
// FIX: Imported DocsIcon to be used as a default file icon.
import { PdfIcon, DocxIcon, XlsxIcon, PngIcon, DocsIcon } from './icons';

// DCN Principle Simulation: File Integrity Check
// This function simulates creating a hash of a file before upload. In a real system,
// this hash would be sent to the server, which would re-calculate the hash on the received
// file to ensure it wasn't corrupted during transit.
const mockCalculateHash = (file: File): Promise<string> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // In a real app, use a library like crypto-js.
            // For this simulation, a simple string is enough.
            const hash = `mock-hash-${file.name}-${file.size}`;
            resolve(hash);
        }, 500);
    });
};

const Documents: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const fetchDocuments = useCallback(async () => {
        setLoading(true);
        const docs = await getDocuments();
        setDocuments(docs);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);
    
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);

        // Simulate integrity check
        console.log("DCN SIM: Calculating file hash for integrity check...");
        const hash = await mockCalculateHash(file);
        console.log(`DCN SIM: Calculated hash: ${hash}`);

        // Simulate upload progress
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setUploading(false);
                    // Add the new doc to the list to simulate a successful upload
                    const newDoc: Document = {
                        id: `d${Date.now()}`,
                        name: file.name,
                        type: file.name.split('.').pop() as any || 'pdf',
                        size: Math.round(file.size / 1024),
                        version: 1,
                        lastModified: new Date(),
                        uploadedBy: currentUser.name,
                        permissions: [Role.ADMIN, Role.STAFF, Role.FACULTY],
                    };
                    setDocuments(prevDocs => [newDoc, ...prevDocs]);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };

    const getFileIcon = (type: string) => {
        switch(type) {
            case 'pdf': return <PdfIcon />;
            case 'docx': return <DocxIcon />;
            case 'xlsx': return <XlsxIcon />;
            case 'png': return <PngIcon />;
            default: return <DocsIcon />;
        }
    }

    const visibleDocuments = useMemo(() => {
        return documents.filter(doc => doc.permissions.includes(currentUser.role));
    }, [documents, currentUser.role]);
    
    const isAdmin = currentUser.role === Role.ADMIN;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brand-dark">Document Exchange</h2>
                {isAdmin && (
                    <label className="bg-brand-primary text-white font-bold py-2 px-4 rounded-md cursor-pointer hover:bg-brand-accent transition-colors">
                        <span>Upload Document</span>
                        <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading}/>
                    </label>
                )}
            </div>

            {uploading && (
                <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-md">
                    <p className="font-semibold text-blue-800 mb-2">Uploading file...</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                     <p className="text-sm text-gray-600 mt-2">DCN Principle: Simulating efficient file transfer with progress feedback and resume capability (not implemented). An integrity check (mock hash) was performed before starting.</p>
                </div>
            )}
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Name</th>
                            <th className="p-4 font-semibold text-gray-600 hidden md:table-cell">Version</th>
                            <th className="p-4 font-semibold text-gray-600 hidden lg:table-cell">Last Modified</th>
                            <th className="p-4 font-semibold text-gray-600 hidden md:table-cell">Uploaded By</th>
                            <th className="p-4 font-semibold text-gray-600">Size</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({length: 4}).map((_, i) => (
                                <tr key={i}><td colSpan={5}><div className="h-16 bg-gray-200 rounded animate-pulse my-2"></div></td></tr>
                            ))
                        ) : visibleDocuments.map(doc => (
                            <tr key={doc.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 flex items-center">
                                    {getFileIcon(doc.type)}
                                    <span className="ml-4 font-medium text-brand-dark">{doc.name}</span>
                                </td>
                                <td className="p-4 text-gray-700 hidden md:table-cell">v{doc.version}.0</td>
                                <td className="p-4 text-gray-700 hidden lg:table-cell">{doc.lastModified.toLocaleDateString()}</td>
                                <td className="p-4 text-gray-700 hidden md:table-cell">{doc.uploadedBy}</td>
                                <td className="p-4 text-gray-700">{doc.size} KB</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {visibleDocuments.length === 0 && !loading && (
                    <div className="text-center py-10 text-gray-500">
                        <p>No documents available for your role.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Documents;