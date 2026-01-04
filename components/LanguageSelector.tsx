
import React from 'react';
import { Languages, ArrowRight } from 'lucide-react';

interface LanguageSelectorProps {
  onSelect: (lang: 'en' | 'hi') => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-sm text-center">
        <div className="inline-block p-4 bg-emerald-50 rounded-full mb-6">
          <Languages size={40} className="text-emerald-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Pocket Invest</h1>
        <p className="text-slate-500 mb-8 px-4">Choose the language you are most comfortable with.</p>

        <div className="space-y-4">
          <button
            onClick={() => onSelect('en')}
            className="w-full bg-white border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/50 p-6 rounded-2xl shadow-sm transition-all group flex items-center justify-between"
          >
            <div className="text-left">
              <div className="font-bold text-lg text-slate-900">English</div>
              <div className="text-sm text-slate-500">I want to learn in English</div>
            </div>
            <ArrowRight size={20} className="text-slate-300 group-hover:text-emerald-500 transform group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => onSelect('hi')}
            className="w-full bg-white border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/50 p-6 rounded-2xl shadow-sm transition-all group flex items-center justify-between"
          >
            <div className="text-left">
              <div className="font-bold text-lg text-slate-900">हिंदी</div>
              <div className="text-sm text-slate-500">मैं हिंदी में सीखना चाहता हूँ</div>
            </div>
            <ArrowRight size={20} className="text-slate-300 group-hover:text-emerald-500 transform group-hover:translate-x-1 transition-all" />
          </button>
        </div>

        <p className="mt-12 text-xs text-slate-300 italic">
          You can change this later in your profile settings.
        </p>
      </div>
    </div>
  );
};
