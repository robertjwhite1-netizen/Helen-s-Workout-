import React, { useState } from 'react';
import { WorkoutSession, WorkoutPlan } from '../types';
import { ChevronLeft, Calendar, Dumbbell, ChevronDown, ChevronUp, Trash2, Award } from 'lucide-react';
import { calculateProgression, DEFAULT_WORKOUTS } from '../data';

interface HistoryListProps {
  sessions: WorkoutSession[];
  onBack: () => void;
  onDeleteSession: (sessionId: string) => void;
  workouts: WorkoutPlan[];
}

export default function HistoryList({ sessions, onBack, onDeleteSession, workouts }: HistoryListProps) {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const toggleExpand = (sessionId: string) => {
    setExpandedSessionId(expandedSessionId === sessionId ? null : sessionId);
  };

  const getExerciseDetails = (eId: string) => {
    // Find exercise details from standard workouts to obtain rep limits for recommendation calculations
    for (const w of workouts) {
      const found = w.exercises.find(ex => ex.id === eId);
      if (found) return found;
    }
    // Fallback if not found inside current edited settings workouts
    for (const w of DEFAULT_WORKOUTS) {
      const found = w.exercises.find(ex => ex.id === eId);
      if (found) return found;
    }
    return null;
  };

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div id="history-view" className="flex flex-col gap-4 w-full animate-in fade-in duration-300">
      
      {/* Header with back */}
      <div className="flex items-center justify-between">
        <button
          id="history-back-btn"
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-[#97A382] py-2 px-4 rounded-full bg-white hover:bg-white/80 border border-black/5 transition-all cursor-pointer shadow-xs"
        >
          <ChevronLeft size={14} /> Back
        </button>
        <span className="text-xs font-semibold text-gray-500 bg-white border border-black/5 px-3 py-1.5 rounded-full">
          Logs: {sessions.length}
        </span>
      </div>

      <div className="pl-1 font-sans">
        <h1 className="text-2xl font-semibold tracking-tight text-black">
          Workout History
        </h1>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
          Helen’s growth & achievements.
        </p>
      </div>

      {sortedSessions.length === 0 ? (
        <div className="bg-white border border-black/5 text-center p-8 rounded-[32px] flex flex-col items-center gap-3 mt-4">
          <Award size={36} className="text-gray-300" />
          <h3 className="text-sm font-semibold text-gray-800">No workout logs yet</h3>
          <p className="text-xs text-gray-500 max-w-[210px] leading-relaxed">
            Your entries will appear here as soon as you complete a day's workout. Let's do it!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-2">
          {sortedSessions.map((session) => {
            const isExpanded = expandedSessionId === session.id;
            const formattedDate = new Date(session.date).toLocaleDateString('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            const completedCount = session.completedExercises.reduce((total, ex) => {
              return total + ex.sets.filter(s => s.completed).length;
            }, 0);

            return (
              <div
                id={`history-card-${session.id}`}
                key={session.id}
                className="bg-white rounded-[32px] border border-black/5 shadow-sm transition-all overflow-hidden"
              >
                {/* Expandable trigger row */}
                <div
                  id={`history-row-trigger-${session.id}`}
                  onClick={() => toggleExpand(session.id)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/70 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-[16px] bg-[#E8EBDD] text-[#97A382] shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {formattedDate}
                      </h3>
                      <h4 className="text-base font-medium text-black mt-0.5">
                        {session.workoutName}
                      </h4>
                      <p className="text-xs text-[#97A382] mt-0.5 font-semibold">
                        {completedCount} sets completed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`delete-session-btn-${session.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Are you sure Helen wants to remove this history entry?")) {
                          onDeleteSession(session.id);
                        }
                      }}
                      className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-700 rounded-full transition-all"
                      title="Delete log entry"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="p-1.5 bg-black/5 rounded-full text-gray-600">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>
                </div>

                {/* Collapsible stats detail panels */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-black/5 bg-[#F5F7F0]/40 space-y-4 animate-in fade-in duration-200">
                    <div className="h-1" />
                    
                    {session.notes && (
                      <div className="bg-[#E8EBDD] p-4 rounded-[16px] border border-black/5 text-xs">
                        <span className="font-bold text-[10px] uppercase tracking-wider text-gray-600 block mb-1">Helen's Notes</span>
                        <p className="italic text-gray-800">"{session.notes}"</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      {session.completedExercises.map((loggedEx, idx) => {
                        const originalEx = getExerciseDetails(loggedEx.exerciseId);
                        const completes = loggedEx.sets.filter(s => s.completed);
                        
                        // Recalculate recommendation for retrospect lookup!
                        let suggestionStr = null;
                        if (originalEx) {
                          const result = calculateProgression(originalEx, loggedEx.sets);
                          suggestionStr = result.reason;
                        }

                        return (
                          <div
                            id={`history-ex-row-${session.id}-${idx}`}
                            key={idx}
                            className="bg-white p-4 rounded-[24px] border border-black/5 text-xs flex flex-col gap-2 shadow-xs"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-semibold text-black text-sm">{loggedEx.exerciseName}</h5>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                                  {originalEx?.muscleGroup || 'Core/Toning'}
                                </span>
                              </div>
                              <span className="text-xs font-semibold text-gray-500 bg-[#F5F7F0] px-2 py-0.5 rounded-full">
                                {completes.length} sets
                              </span>
                            </div>

                            {completes.length > 0 ? (
                              <div className="grid grid-cols-3 gap-2 py-2 border-y border-black/5 font-mono text-xs text-gray-800">
                                {completes.map((s, sIdx) => (
                                  <div key={sIdx} className="text-center bg-[#F5F7F0] p-1.5 rounded-lg border border-black/5">
                                    <span className="text-gray-400 block text-[9px] uppercase font-sans font-bold">Set {s.setNumber}</span>
                                    <span className="font-semibold">{s.weight}kg × {s.reps}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs italic text-gray-400 py-1">Skipped or not completed.</p>
                            )}

                            {suggestionStr && completes.length > 0 && (
                              <div className="mt-1 bg-[#F5F7F0] p-3 rounded-[16px] border border-black/5 text-xs text-gray-800 flex gap-2">
                                <Award size={13} className="text-[#97A382] shrink-0 mt-0.5" />
                                <span>{suggestionStr}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
