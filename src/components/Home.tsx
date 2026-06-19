import React, { useState, useEffect } from 'react';
import { WorkoutPlan, WorkoutSession, AppSettings } from '../types';
import { Sparkles, Calendar, ChevronRight, History, Settings, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeProps {
  workouts: WorkoutPlan[];
  sessions: WorkoutSession[];
  settings: AppSettings;
  onSelectWorkout: (plan: WorkoutPlan) => void;
  onNavigateTo: (view: 'home' | 'history' | 'settings') => void;
}

export default function Home({
  workouts,
  sessions,
  settings,
  onSelectWorkout,
  onNavigateTo
}: HomeProps) {
  const [affirmation, setAffirmation] = useState('Embrace your journey today.');

  // Fetch a dynamic affirmation from the backend upon app opening
  useEffect(() => {
    fetch('/api/affirmation')
      .then(res => res.json())
      .then(data => {
        if (data && data.affirmation) {
          setAffirmation(data.affirmation);
        }
      })
      .catch(err => {
        console.error("Error loading affirmation from backend:", err);
      });
  }, []);

  // Check which workouts were completed in the last 7 days
  const isWorkoutCompletedThisWeek = (planId: string) => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return sessions.some(s => s.workoutPlanId === planId && new Date(s.date).getTime() > sevenDaysAgo);
  };

  // Logic to suggest what to do next
  const getNextWorkoutSuggestion = () => {
    if (sessions.length === 0) {
      return {
        next: workouts[0],
        message: "Welcome, Helen! Tap Workout 1 — Monday to start your journey."
      };
    }

    // Sort sessions newest to oldest
    const sorted = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastSession = sorted[0];

    if (lastSession.workoutPlanId === 'w1') {
      const nextPlan = workouts.find(w => w.id === 'w2') || workouts[0];
      return { next: nextPlan, message: `Well done on completing ${lastSession.workoutName}! Next up is ${nextPlan.name} (usually ${nextPlan.day}).` };
    }
    if (lastSession.workoutPlanId === 'w2') {
      const nextPlan = workouts.find(w => w.id === 'w3') || workouts[0];
      return { next: nextPlan, message: `Awesome core & legs work! Your next target is ${nextPlan.name} (${nextPlan.day}).` };
    }
    // w3 or unspecified
    const nextPlan = workouts.find(w => w.id === 'w1') || workouts[0];
    return { next: nextPlan, message: `Weekly cycle complete! Ready to start strong with ${nextPlan.name} on ${nextPlan.day}?` };
  };

  const recommendation = getNextWorkoutSuggestion();

  return (
    <div id="home-view" className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      
      {/* Title & Affirmation Header */}
      <div className="text-center mt-2 flex flex-col items-center">

        {/* Minimalist supportive quote bubble */}
        <motion.div 
          id="affirmation-bubble"
          key={affirmation}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6 p-6 rounded-[32px] bg-white border border-black/5 relative max-w-[290px] text-center shadow-sm"
        >
          <p className="text-lg italic leading-relaxed text-gray-800">
            “{affirmation}”
          </p>
          <div className="absolute right-3 bottom-3 text-black/20">
            <Sparkles size={12} />
          </div>
        </motion.div>
      </div>

      {/* Three Workouts Listing Section */}
      <div className="flex flex-col gap-3 mt-1">
        <p className="text-[11px] uppercase tracking-widest text-gray-500 font-bold pl-1">
          Weekly Plan
        </p>

        <div className="flex flex-col gap-3">
          {workouts.map((plan) => {
            const completed = isWorkoutCompletedThisWeek(plan.id);
            return (
              <div
                id={`workout-card-${plan.id}`}
                key={plan.id}
                onClick={() => onSelectWorkout(plan)}
                className="group relative flex items-center justify-between p-6 bg-white hover:bg-white/80 rounded-[32px] border border-black/5 shadow-sm transition-all cursor-pointer overflow-hidden transform active:scale-98 duration-150"
              >
                {/* Visual side accent matching Geometric Balance tab lines */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#97A382]/20 group-hover:bg-[#97A382] transition-colors" />

                <div className="flex flex-col gap-1 pl-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold bg-[#97A382] text-white px-3 py-1 rounded-full">
                      {plan.day}
                    </span>
                    {completed && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-[#97A382]">
                        <CheckCircle2 size={13} className="fill-[#DCE2D1]" /> Completed
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-black mt-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {plan.focus}
                  </p>
                </div>

                <div className="bg-[#F5F7F0] group-hover:bg-[#E8EBDD] p-3 rounded-full transition-colors shrink-0 shadow-sm">
                  <ChevronRight size={18} className="text-black/80" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Secondary Quick Navigation Controls matching Sidebar sections */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        <button
          id="history-nav-btn"
          onClick={() => onNavigateTo('history')}
          className="flex flex-col items-center justify-center p-5 bg-white hover:bg-white/80 border border-black/5 rounded-[32px] gap-2.5 cursor-pointer transition-all shadow-sm active:scale-95"
        >
          <div className="p-3 bg-[#E8EBDD] rounded-full text-black">
            <History size={18} />
          </div>
          <span className="text-sm font-medium tracking-tight">Workout History</span>
        </button>

        <button
          id="settings-nav-btn"
          onClick={() => onNavigateTo('settings')}
          className="flex flex-col items-center justify-center p-5 bg-white hover:bg-white/80 border border-black/5 rounded-[32px] gap-2.5 cursor-pointer transition-all shadow-sm active:scale-95"
        >
          <div className="p-3 bg-[#E8EBDD] rounded-full text-black">
            <Settings size={18} />
          </div>
          <span className="text-sm font-medium tracking-tight">App Settings</span>
        </button>
      </div>

      {/* Helpful quote footer */}
      <div className="text-center mt-3 text-xs text-gray-500 font-medium">
        Helen’s Calm Track • One gentle step at a time
      </div>
    </div>
  );
}
