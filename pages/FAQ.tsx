import React, { useEffect, useState } from 'react';
import { FAQItem } from '../types';
import * as api from "../services/firebaseApi";
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQ: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    api.getFAQs().then(setFaqs);
  }, []);

  return (
    <div className="p-4 pb-24 max-w-md mx-auto min-h-screen">
      <header className="mb-6 flex items-center space-x-3">
        <div className="bg-indigo-100 p-2 rounded-full">
          <HelpCircle className="text-indigo-600" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Common Questions</h1>
          <p className="text-slate-500 text-sm">Clearing your doubts.</p>
        </div>
      </header>

      <div className="space-y-3">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div 
              key={faq.id} 
              className={`bg-white rounded-xl border transition-all overflow-hidden ${
                isOpen ? 'border-indigo-200 shadow-md' : 'border-slate-100'
              }`}
            >
              <button
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full px-5 py-4 flex justify-between items-center text-left"
              >
                <span className={`font-semibold ${isOpen ? 'text-indigo-900' : 'text-slate-700'}`}>
                  {faq.question}
                </span>
                {isOpen ? <ChevronUp size={20} className="text-indigo-500" /> : <ChevronDown size={20} className="text-slate-400" />}
              </button>
              
              {isOpen && (
                <div className="px-5 pb-5 pt-0 text-slate-600 text-sm leading-relaxed bg-indigo-50/30">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 text-center p-6 bg-slate-100 rounded-2xl">
        <p className="text-sm text-slate-500 mb-2">Still have questions?</p>
        <button className="text-indigo-600 font-semibold text-sm hover:underline">
          Chat with our guide
        </button>
      </div>
    </div>
  );
};

export default FAQ;
