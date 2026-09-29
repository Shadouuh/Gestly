import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white overflow-hidden">
      {/* Background Dot Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.4]" 
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      ></div>

      {/* Floating Particles */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-400 rounded-full opacity-20 animate-[float_3s_ease-in-out_infinite]" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-3/4 left-1/3 w-4 h-4 bg-indigo-400 rounded-full opacity-20 animate-[float_4s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-sky-400 rounded-full opacity-20 animate-[float_2.5s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-1/4 right-1/3 w-5 h-5 bg-blue-300 rounded-full opacity-20 animate-[float_3.5s_ease-in-out_infinite]" style={{ animationDelay: '1.5s' }}></div>

      {/* Center Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Minimalist Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        
        {/* Optional Logo or Text could go here */}
        {/* <div className="mt-4 text-slate-400 text-sm font-medium tracking-widest uppercase">Loading</div> */}
      </div>
    </div>
  );
};

export default LoadingScreen;
