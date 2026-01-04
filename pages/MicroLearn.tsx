import React, { useEffect, useState } from 'react';
import { Lesson, UserProfile } from '../types';
import * as api from "../services/firebaseApi";
import { aiService } from '../services/aiService';
import { Clock, CheckCircle, PlayCircle, X, Sparkles, BookOpen, Lightbulb, GraduationCap } from 'lucide-react';

interface MicroLearnProps {
  user: UserProfile;
  onUpdateUser: (u: UserProfile) => void;
}

const AI_TOPICS = [
  "Emergency Fund Importance",
  "How Banks Work",
  "Inflation Explained",
  "Dividend Meaning",
  "Why Diversify",
  "Tax on Investments",
  "Credit Score Basics",
  "Gold vs. Digital Gold"
];

const MicroLearn: React.FC<MicroLearnProps> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'structured' | 'topics'>('structured');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  
  // Lesson Modal State
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  
  // AI Feature State
  const [dailyTip, setDailyTip] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.getLessons().then(setLessons);
    loadDailyTip();
  }, []);

  const loadDailyTip = async () => {
    const tip = await aiService.getQuickTip();
    setDailyTip(tip);
  };

  const handleComplete = async (lessonId: string) => {
    if (!lessonId.startsWith('ai_') && !user.completedLessonIds.includes(lessonId)) {
      await api.markLessonComplete(user.uid, lessonId);
      onUpdateUser({
        ...user,
        completedLessonIds: [...user.completedLessonIds, lessonId]
      });
    }
    setActiveLesson(null);
  };

  const handleTopicClick = async (topic: string) => {
    setGenerating(true);
    // Create a temporary "loading" lesson object
    const tempLesson: Lesson = {
      id: `ai_${Date.now()}`,
      title: topic,
      category: 'AI Topic',
      duration: '1 min',
      content: '<div class="animate-pulse space-y-4"><div class="h-4 bg-slate-200 rounded w-3/4"></div><div class="h-4 bg-slate-200 rounded w-full"></div><div class="h-4 bg-slate-200 rounded w-5/6"></div></div>'
    };
    setActiveLesson(tempLesson);

    const content = await aiService.generateLesson(topic);
    
    // Update with real content
    setActiveLesson({
      ...tempLesson,
      content: content
    });
    setGenerating(false);
  };

  const completedCount = user.completedLessonIds.length;
  const totalCount = lessons.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="p-4 pb-24 max-w-md mx-auto min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          Micro-Learn <GraduationCap className="ml-2 text-emerald-600" />
        </h1>
        <p className="text-slate-500 text-sm">1 minute a day keeps the fear away.</p>
        
        {/* Daily Tip Card */}
        <div className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl text-white shadow-lg relative overflow-hidden">
          <Sparkles className="absolute top-2 right-2 text-yellow-300 opacity-50" size={40} />
          <div className="flex items-center space-x-2 mb-2">
            <Lightbulb size={16} className="text-yellow-300" />
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Tip of the Day</span>
          </div>
          <p className="text-sm font-medium leading-relaxed relative z-10">
            {dailyTip || "Loading your daily nugget of wisdom..."}
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab('structured')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'structured' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Structure Course
        </button>
        <button
          onClick={() => setActiveTab('topics')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center ${
            activeTab === 'topics' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles size={12} className="mr-1" />
          AI Explore
        </button>
      </div>

      {activeTab === 'structured' ? (
        <>
          {/* Progress Bar */}
          <div className="mb-4 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-2">
              <span>Your Progress</span>
              <span>{completedCount}/{totalCount} completed</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div 
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-3">
            {lessons.map((lesson) => {
              const isCompleted = user.completedLessonIds.includes(lesson.id);
              return (
                <div 
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`group relative p-4 bg-white rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                    isCompleted ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {lesson.category}
                        </span>
                        <div className="flex items-center text-slate-400 text-xs">
                          <Clock size={12} className="mr-1" /> {lesson.duration}
                        </div>
                      </div>
                      <h3 className={`font-semibold ${isCompleted ? 'text-slate-600' : 'text-slate-800'}`}>
                        {lesson.title}
                      </h3>
                    </div>
                    {isCompleted ? (
                      <CheckCircle className="text-emerald-500" size={24} />
                    ) : (
                      <PlayCircle className="text-slate-300 group-hover:text-emerald-500 transition-colors" size={24} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* AI Explore View */
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-4">
            <h3 className="text-indigo-900 font-bold text-sm mb-1">Curious? Just ask!</h3>
            <p className="text-indigo-700 text-xs">Pick a topic below and our AI tutor will create a custom simple lesson for you instantly.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {AI_TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => handleTopicClick(topic)}
                className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all text-left group"
              >
                <div className="bg-indigo-50 w-8 h-8 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <BookOpen size={16} className="text-indigo-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 leading-tight group-hover:text-indigo-700">{topic}</h3>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {activeLesson && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white w-full max-w-md h-[85vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-10">
            <div className="p-6 flex-1 overflow-y-auto">
               <div className="flex justify-between items-center mb-6">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                   activeLesson.category === 'AI Topic' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-emerald-100 text-emerald-700'
                 }`}>
                   {activeLesson.category}
                 </span>
                 <button onClick={() => setActiveLesson(null)} className="p-1 rounded-full hover:bg-slate-100">
                   <X size={24} className="text-slate-500" />
                 </button>
               </div>
               
               <h2 className="text-2xl font-bold text-slate-900 mb-4">{activeLesson.title}</h2>
               
               {generating && activeLesson.category === 'AI Topic' ? (
                 <div className="space-y-4 animate-pulse">
                   <div className="h-4 bg-slate-200 rounded w-full"></div>
                   <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                   <div className="h-32 bg-slate-100 rounded-xl"></div>
                   <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                 </div>
               ) : (
                 <div 
                   className="prose prose-slate prose-sm sm:prose-base prose-p:text-slate-600 prose-headings:text-slate-800 prose-strong:text-slate-900 leading-relaxed"
                   dangerouslySetInnerHTML={{ __html: activeLesson.content }}
                 />
               )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl sm:rounded-b-2xl">
              <button 
                onClick={() => handleComplete(activeLesson.id)}
                disabled={generating}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-200 active:scale-95 transition-all flex justify-center items-center"
              >
                <CheckCircle size={20} className="mr-2" />
                {activeLesson.category === 'AI Topic' ? 'Close Topic' : 'Mark as Understood'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MicroLearn;