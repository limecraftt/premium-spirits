import React from 'react';
import { Wine, X } from 'lucide-react';

const AgeVerificationModal = ({ onVerify }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg p-8 max-w-md w-full relative border border-zinc-800">
        <button 
          onClick={() => {}} 
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
        >
          <X size={24} />
        </button>
        
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
            <Wine className="text-amber-500" size={32} />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white text-center mb-4">Age Verification</h2>
        
        <p className="text-zinc-400 text-center mb-8">
          You must be of legal drinking age to enter this site.
          Please confirm you are 21 years or older.
        </p>
        
        <div className="space-y-3">
          <button 
            onClick={() => onVerify(true)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-3 rounded-lg transition-colors"
          >
            I am 21 or older
          </button>
          
          <button 
            onClick={() => onVerify(false)}
            className="w-full bg-transparent hover:bg-zinc-800 text-white font-semibold py-3 rounded-lg border border-zinc-700 transition-colors"
          >
            I am under 21
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgeVerificationModal;