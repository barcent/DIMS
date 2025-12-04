
import React from 'react';

interface LandingPageProps {
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-brand-light">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
               <div className="w-9 h-9 bg-gradient-to-br from-brand-primary to-brand-primary-light rounded-lg flex items-center justify-center text-white font-bold shadow-md">D</div>
               <span className="font-bold text-xl text-brand-dark tracking-tight">DIMS</span>
            </div>
            <button
              onClick={onLogin}
              className="bg-brand-primary hover:bg-brand-primary-light text-white font-semibold py-2 px-6 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Log In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-brand-dark">
         {/* Gradient Mesh Background */}
         <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary via-[#052e16] to-brand-dark z-0"></div>
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent opacity-10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-primary opacity-20 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center relative z-10 py-24 md:py-32">
            <div className="md:w-1/2 mb-12 md:mb-0">
              <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-brand-accent text-xs font-bold mb-6 uppercase tracking-wider shadow-sm">
                Networked Division Management
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 text-white tracking-tight">
                Division Information <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-yellow-200">Management System</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-lg">
                Experience the principles of Data Communication and Networking through a unified platform for real-time collaboration, secure document exchange, and efficient workflow management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={onLogin}
                    className="bg-brand-accent text-brand-dark font-bold py-3.5 px-8 rounded-full text-lg hover:bg-yellow-400 transition-all duration-300 shadow-lg hover:shadow-yellow-500/30 transform hover:-translate-y-1 text-center"
                >
                    Access Portal
                </button>
                <button 
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold py-3.5 px-8 rounded-full text-lg hover:bg-white/20 transition-all duration-300 text-center"
                >
                    Learn More
                </button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center items-center">
               {/* Abstract Network Illustration */}
               <svg className="w-full max-w-lg h-auto text-white drop-shadow-2xl" viewBox="0 0 240 240" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="120" cy="120" r="110" className="text-brand-primary opacity-10" fill="currentColor" stroke="none" />
                  
                  {/* Nodes */}
                  <g className="animate-pulse-fast">
                      <circle cx="120" cy="40" r="8" className="fill-brand-accent stroke-white shadow-lg" strokeWidth="2" />
                  </g>
                  <circle cx="200" cy="120" r="8" className="fill-white stroke-white" />
                  <circle cx="120" cy="200" r="8" className="fill-white stroke-white" />
                  <circle cx="40" cy="120" r="8" className="fill-white stroke-white" />
                  <circle cx="120" cy="120" r="20" className="fill-brand-primary stroke-white shadow-xl" strokeWidth="2" />
                  
                  {/* Connections */}
                  <path d="M120 48 V 104" className="opacity-40" strokeDasharray="4 4" />
                  <path d="M192 120 H 136" className="opacity-40" />
                  <path d="M120 192 V 136" className="opacity-40" />
                  <path d="M48 120 H 104" className="opacity-40" />
                  
                  {/* Pulse Animation Rings */}
                  <circle cx="120" cy="120" r="40" className="stroke-brand-accent opacity-20 animate-ping" style={{animationDuration: '3s'}} />
                  <circle cx="120" cy="120" r="70" className="stroke-white opacity-10" />
               </svg>
            </div>
         </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">System Capabilities</h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">
                Built to demonstrate core networking concepts such as topology, transmission modes, and security protocols within a modern web application context.
            </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                <FeatureCard
                    title="Real-time Directory"
                    description="Simulates a publish/subscribe model for user presence, reflecting active nodes in the network topology."
                    icon={<UserGroupIcon />}
                    color="bg-blue-50 text-blue-600"
                />
                <FeatureCard
                    title="Secure Document Exchange"
                    description="Demonstrates file integrity checks and permission-based access control lists (ACLs) for data security."
                    icon={<DocumentIcon />}
                    color="bg-green-50 text-brand-secondary"
                />
                <FeatureCard
                    title="Service Requests"
                    description="Implements a priority-queueing mechanism for ticket handling, similar to packet switching networks."
                    icon={<TicketIcon />}
                    color="bg-red-50 text-brand-primary"
                />
            </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-brand-light border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
             <span className="font-bold text-lg text-brand-dark">DIMS</span>
             <p className="text-sm text-gray-500 mt-1">&copy; {new Date().getFullYear()} DIMS Project. All rights reserved.</p>
          </div>
          <div className="flex space-x-8 text-sm font-medium text-gray-500">
              <a href="#" className="hover:text-brand-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-brand-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-brand-primary transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ title, description, icon, color }: any) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
    <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-brand-dark mb-3 group-hover:text-brand-primary transition-colors">{title}</h3>
    <p className="text-gray-500 leading-relaxed">{description}</p>
  </div>
);

// Simple internal icons for the landing page
const UserGroupIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const TicketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
);

export default LandingPage;
