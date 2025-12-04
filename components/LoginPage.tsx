
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { MOCK_DIRECTORY_USERS } from '../constants';

interface LoginPageProps {
    onLogin: (user: User) => void;
    onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBack }) => {
    const [selectedUserId, setSelectedUserId] = useState<string>(MOCK_DIRECTORY_USERS[0].id);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [canAgree, setCanAgree] = useState(false);
    const termsContentRef = useRef<HTMLDivElement>(null);

    const handleLogin = () => {
        const user = MOCK_DIRECTORY_USERS.find(u => u.id === selectedUserId);
        if (user && acceptedTerms) {
            onLogin(user);
        }
    };

    const handleScroll = () => {
        if (termsContentRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = termsContentRef.current;
            if (Math.ceil(scrollTop + clientHeight) >= scrollHeight - 20) {
                setCanAgree(true);
            }
        }
    };

    useEffect(() => {
        if (showTermsModal) {
            setCanAgree(false);
            const timer = setTimeout(() => {
                if (termsContentRef.current) {
                    const { scrollHeight, clientHeight } = termsContentRef.current;
                    if (scrollHeight <= clientHeight + 10) {
                        setCanAgree(true);
                    }
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [showTermsModal]);

    const handleAgree = () => {
        setAcceptedTerms(true);
        setShowTermsModal(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center font-sans p-4 relative overflow-hidden bg-brand-light">
             {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary via-brand-dark to-brand-primary opacity-90 z-0"></div>
            
            {/* Animated Blobs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-brand-accent rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-brand-primary-light rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-brand-secondary-light rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-4000"></div>

            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 z-10">
               {/* Header */}
               <div className="text-center mb-8">
                   <div className="w-14 h-14 bg-gradient-to-br from-brand-primary to-brand-primary-light rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg transform rotate-3">D</div>
                   <h2 className="text-3xl font-extrabold text-brand-dark tracking-tight">Welcome Back</h2>
                   <p className="text-gray-500 text-sm mt-2">Sign in to Division Information Management System</p>
               </div>

               {/* User Selection */}
               <div className="mb-6">
                    <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2">Select Simulation Role</label>
                    <div className="relative">
                        <select
                            className="w-full p-3 pl-4 pr-10 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none appearance-none transition-shadow duration-200 text-gray-700 font-medium"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                            {MOCK_DIRECTORY_USERS.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name} — {user.role}
                                </option>
                            ))}
                        </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
               </div>

               {/* Terms and Conditions Section */}
               <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
                   <div className="flex items-start">
                       <div className="flex items-center h-5">
                            <input
                                id="terms-checkbox"
                                type="checkbox"
                                checked={acceptedTerms}
                                readOnly
                                className={`h-4 w-4 rounded border-gray-300 focus:ring-brand-primary transition-colors ${acceptedTerms ? 'text-brand-primary cursor-default' : 'text-gray-300 cursor-not-allowed'}`}
                            />
                       </div>
                       <div className="ml-3 text-sm">
                           <span className="text-gray-600 block">
                               I have read and agree to the <button onClick={() => setShowTermsModal(true)} className="text-brand-primary font-bold hover:text-brand-primary-light hover:underline focus:outline-none transition-colors">Terms and Conditions</button>.
                           </span>
                           <p className="text-xs text-gray-400 mt-1">
                               Required for access.
                           </p>
                       </div>
                   </div>
               </div>

               {/* Actions */}
               <div className="flex flex-col gap-3">
                   <button
                       onClick={handleLogin}
                       disabled={!acceptedTerms}
                       className={`w-full font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all duration-300 transform flex justify-center items-center ${
                           acceptedTerms
                           ? 'bg-gradient-to-r from-brand-primary to-brand-primary-light text-white hover:shadow-xl hover:-translate-y-0.5'
                           : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                       }`}
                   >
                       Log In
                   </button>
                   <button
                       onClick={onBack}
                       className="w-full bg-white text-gray-600 font-bold py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:text-gray-800 transition-colors duration-200"
                   >
                       Back to Home
                   </button>
               </div>
            </div>

            {/* Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark bg-opacity-80 backdrop-blur-sm transition-opacity duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-fade-in-up border border-gray-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-brand-dark">Terms and Conditions</h3>
                            <button onClick={() => setShowTermsModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div 
                            ref={termsContentRef}
                            onScroll={handleScroll}
                            className="p-8 overflow-y-auto leading-relaxed text-gray-600 text-sm space-y-4 flex-1 scroll-smooth"
                        >
                            <p className="font-semibold text-brand-primary">Please read these terms carefully. You must scroll to the bottom to accept.</p>
                            
                            <h4 className="font-bold text-gray-800 text-base">1. Acceptance of Terms</h4>
                            <p>By accessing the Division Information Management System (DIMS), you agree to simulate compliance with all mock protocols and data integrity demonstrations. These terms constitute a binding agreement between you and the simulation environment.</p>
                            
                            <h4 className="font-bold text-gray-800 text-base">2. Data Privacy</h4>
                            <p>This is a demonstration application. No real personal data is stored or processed. All user entities are fictitious. Any resemblance to real persons, living or dead, is purely coincidental. We do not use cookies for tracking purposes in this simulation.</p>
                            
                            <h4 className="font-bold text-gray-800 text-base">3. Usage Policy</h4>
                            <p>Users must adhere to the role-based access controls assigned to their simulated identity. Unauthorized attempts to access admin-only features as a staff member will be visually blocked. You agree not to attempt to inject malicious scripts, although this is a client-side demo and it wouldn't persist anyway.</p>
                            
                            <h4 className="font-bold text-gray-800 text-base">4. System Monitoring</h4>
                            <p>All actions performed within this simulation are subject to logging for educational analysis of network traffic patterns. Simulated logs may be generated to demonstrate system observability.</p>
                            
                            <h4 className="font-bold text-gray-800 text-base">5. Intellectual Property</h4>
                            <p>The design and code structure of this application are for educational demonstration. You may not copy the specific 'UP Maroon' color hex unless you really like it.</p>
                            
                            <h4 className="font-bold text-gray-800 text-base">6. Limitation of Liability</h4>
                            <p>The developers are not liable for any confusion caused by the realistic nature of this simulation. It is not a real production system.</p>
                            
                            <h4 className="font-bold text-gray-800 text-base">7. Modifications</h4>
                            <p>We reserve the right to modify these terms at any time. Continued use of the simulation implies acceptance of the new terms.</p>
                            
                            <h4 className="font-bold text-gray-800 text-base">8. Governing Law</h4>
                            <p>These terms are governed by the laws of the Internet and the protocols of TCP/IP.</p>
                            
                            <h4 className="font-bold text-gray-800 text-base">9. Contact Information</h4>
                            <p>For questions, please shout into the void or check the console logs.</p>
                            
                            <h4 className="font-bold text-gray-800 text-base">10. Final Provisions</h4>
                            <p>If any part of these terms is found to be invalid, the rest remains in full force and effect. Enjoy the DIMS experience.</p>
                            
                            <div className="pt-8 pb-4 text-center text-gray-400 text-xs italic">
                                --- End of Terms ---
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button 
                                onClick={() => setShowTermsModal(false)}
                                className="px-5 py-2.5 bg-white text-gray-700 font-bold rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Cancel
                            </button>
                            {canAgree ? (
                                <button 
                                    onClick={handleAgree}
                                    className="px-8 py-2.5 bg-gradient-to-r from-brand-primary to-brand-primary-light text-white font-bold rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                                >
                                    I Agree
                                </button>
                            ) : (
                                <button 
                                    disabled
                                    className="px-8 py-2.5 bg-gray-200 text-gray-400 font-bold rounded-xl cursor-not-allowed transition-colors"
                                >
                                    Scroll to Agree
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default LoginPage;
