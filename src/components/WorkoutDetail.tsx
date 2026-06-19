import React, { useState, useEffect } from 'react';
import { WorkoutPlan, Exercise, LoggedExercise, LoggedSet, WorkoutSession } from '../types';
import { ChevronLeft, Check, CheckSquare, Square, Play, Sparkles, Smile, MessageSquare } from 'lucide-react';
import { calculateProgression } from '../data';
import { motion } from 'motion/react';

interface WorkoutDetailProps {
  workout: WorkoutPlan;
  sessions: WorkoutSession[];
  units: 'kg' | 'lbs';
  onSaveSession: (session: WorkoutSession) => void;
  onBack: () => void;
  onStartRestTimer: (seconds: number) => void;
}

export default function WorkoutDetail({
  workout,
  sessions,
  units,
  onSaveSession,
  onBack,
  onStartRestTimer
}: WorkoutDetailProps) {
  // Initialize state representing the user's input for this session
  // Key: exerciseId, Value: array of LoggedSets
  const [loggedExercises, setLoggedExercises] = useState<{ [exId: string]: LoggedSet[] }>({});
  const [notes, setNotes] = useState('');
  const [showCompletionSummary, setShowCompletionSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    date: string;
    workoutName: string;
    exercises: {
      name: string;
      logs: string;
      suggestion: string;
    }[];
  } | null>(null);

  // Initialize empty tracking forms on load
  useEffect(() => {
    const initialLogs: { [exId: string]: LoggedSet[] } = {};
    
    workout.exercises.forEach((ex) => {
      // Find the suggested starting weight
      const initialWeight = ex.startingSuggestion > 0 ? ex.startingSuggestion : '';
      const initialReps = ex.repMax; // target top of rep range by default

      const sets: LoggedSet[] = [];
      for (let i = 1; i <= ex.sets; i++) {
        sets.push({
          setNumber: i,
          weight: initialWeight,
          reps: initialReps,
          completed: false
        });
      }
      initialLogs[ex.id] = sets;
    });

    setLoggedExercises(initialLogs);
  }, [workout]);

  // Hook up helper to retrieve previous performance for an exercise
  const getPreviousPerformance = (exerciseId: string) => {
    // Find latest completed workout session that has this exercise
    const sorted = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const session of sorted) {
      const foundEx = session.completedExercises.find(ce => ce.exerciseId === exerciseId);
      if (foundEx) {
        const completedSets = foundEx.sets.filter(s => s.completed);
        if (completedSets.length > 0) {
          const setsSummary = completedSets.map(s => `${s.weight}${units} x ${s.reps}`).join(', ');
          return {
            date: new Date(session.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
            summary: setsSummary
          };
        }
      }
    }
    return null;
  };

  // Handle inputs
  const handleInputChange = (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: string) => {
    setLoggedExercises((prev) => {
      const sets = [...(prev[exerciseId] || [])];
      if (sets[setIndex]) {
        sets[setIndex] = {
          ...sets[setIndex],
          [field]: value
        };
      }
      return {
        ...prev,
        [exerciseId]: sets
      };
    });
  };

  // Toggle set completed checkbox
  const handleToggleCompleted = (exerciseId: string, setIndex: number, exerciseName: string, restSeconds: number) => {
    setLoggedExercises((prev) => {
      const sets = [...(prev[exerciseId] || [])];
      const targetSet = sets[setIndex];
      const isNowCompleted = !targetSet.completed;
      
      if (sets[setIndex]) {
        sets[setIndex] = {
          ...targetSet,
          completed: isNowCompleted
        };
      }

      // If ticked complete, automatically start rest timer
      if (isNowCompleted && restSeconds > 0) {
        onStartRestTimer(restSeconds);
      }

      return {
        ...prev,
        [exerciseId]: sets
      };
    });
  };

  // Save full session
  const handleCompleteWorkout = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Compile exercises with at least one log or standard set layout
    const completedExercisesList: LoggedExercise[] = workout.exercises.map((ex) => {
      const sets = loggedExercises[ex.id] || [];
      return {
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: sets.map(s => ({
          setNumber: s.setNumber,
          weight: s.weight === '' ? 0 : Number(s.weight),
          reps: s.reps === '' ? 0 : Number(s.reps),
          completed: s.completed
        }))
      };
    });

    const session: WorkoutSession = {
      id: `session_${Date.now()}`,
      date: todayStr,
      workoutPlanId: workout.id,
      workoutName: workout.name,
      day: workout.day,
      completedExercises: completedExercisesList,
      notes: notes.trim() !== '' ? notes : undefined
    };

    // Prepare progression recommendations for display summary
    const displayRecommendations = workout.exercises.map((ex) => {
      const sets = loggedExercises[ex.id] || [];
      const result = calculateProgression(ex, sets, units);
      
      const loggedSummary = sets.filter(s => s.completed)
        .map(s => `${s.weight || 0}${units} x ${s.reps || 0}`)
        .join(', ');

      return {
        name: ex.name,
        logs: loggedSummary || "No sets completed",
        suggestion: result.reason
      };
    });

    setSummaryData({
      date: new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }),
      workoutName: workout.name,
      exercises: displayRecommendations
    });

    setShowCompletionSummary(true);
    onSaveSession(session);
  };

  // Trigger quick manual rest timer start
  const handleManualTimer = (seconds: number) => {
    onStartRestTimer(seconds);
  };

  if (showCompletionSummary && summaryData) {
    return (
      <div id="session-summary-panel" className="flex flex-col gap-6 w-full bg-white border border-black/5 p-6 rounded-[32px] shadow-sm animate-in fade-in duration-300">
        <div className="text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#E8EBDD] flex items-center justify-center text-[#97A382] mb-3">
            <Smile size={36} />
          </div>
          <h2 className="text-2xl font-semibold text-black">Workout Complete!</h2>
          <p className="text-xs text-gray-500 mt-1">{summaryData.date}</p>
          <span className="inline-block bg-[#97A382] text-white text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mt-2">
            {summaryData.workoutName}
          </span>
          <p className="text-sm italic py-3 text-gray-700 max-w-[280px] leading-relaxed">
            “Wonderful job logging your session. Every effort brings consistency and confidence!”
          </p>
        </div>

        <div className="border-t border-black/5 pt-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 pl-1">
            Progression for next time
          </h3>

          <div className="flex flex-col gap-4">
            {summaryData.exercises.map((ex, i) => (
              <div id={`summary-item-${i}`} key={i} className="bg-[#F5F7F0] border border-black/5 p-5 rounded-[24px] flex flex-col gap-1 shadow-xs">
                <span className="text-sm font-semibold text-black">{ex.name}</span>
                <span className="text-xs text-gray-500">Logged this time: {ex.logs}</span>
                <div className="mt-3 flex items-start gap-2 text-xs text-gray-800 font-medium bg-white p-3 rounded-[16px] border border-black/5">
                  <Sparkles size={13} className="text-[#97A382] shrink-0 mt-0.5" />
                  <span>{ex.suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {notes.trim() !== '' && (
          <div className="bg-[#E8EBDD] p-4 rounded-[24px] border border-black/5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
              <MessageSquare size={12} /> Notes Captured
            </h4>
            <p className="text-xs text-black/80 mt-1.5 italic">"{notes}"</p>
          </div>
        )}

        <button
          id="finish-summary-btn"
          onClick={onBack}
          className="w-full bg-[#97A382] text-white hover:bg-[#97A382]/90 font-bold text-sm py-4 px-4 rounded-[24px] transition-all cursor-pointer text-center shadow-sm"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div id="workout-detail-view" className="flex flex-col gap-4 w-full animate-in fade-in duration-300 pb-16">
      
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <button
          id="workout-back-btn"
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-[#97A382] py-2 px-4 rounded-full bg-white hover:bg-white/80 border border-black/5 transition-all cursor-pointer shadow-xs"
        >
          <ChevronLeft size={14} /> Back
        </button>
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#97A382] bg-white px-3 py-1.5 rounded-full border border-black/5">
          {workout.day}
        </span>
      </div>

      {/* Title */}
      <div className="mt-2 pl-1">
        <h1 className="text-2xl font-semibold tracking-tight text-black">
          {workout.name}
        </h1>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
          Focus: {workout.focus}
        </p>
      </div>

      {/* Exercises Cards */}
      <div className="flex flex-col gap-5 mt-2">
        {workout.exercises.map((ex) => {
          const prev = getPreviousPerformance(ex.id);
          const sets = loggedExercises[ex.id] || [];
          
          return (
            <div
              id={`exercise-card-${ex.id}`}
              key={ex.id}
              className="bg-white rounded-[32px] p-6 border border-black/5 shadow-sm flex flex-col gap-4"
            >
              {/* Exercise meta info */}
              <div className="flex justify-between items-start border-b border-black/5 pb-3">
                <div>
                  <h3 className="text-lg font-medium text-black">
                    {ex.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      {ex.muscleGroup}
                    </span>
                    <span className="text-[10px] text-gray-300">•</span>
                    <span className="text-[10px] text-[#97A382] uppercase tracking-wider font-semibold">
                      {ex.equipmentType}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-black/85 block">
                    {ex.sets} sets x {ex.repMin === ex.repMax ? ex.repMin : `${ex.repMin}-${ex.repMax}`} reps
                  </span>
                  {ex.startingSuggestion > 0 ? (
                    <span className="text-[11px] text-[#97A382] font-semibold mt-0.5 block">
                      Target: {ex.startingSuggestion}{units}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#97A382] font-semibold mt-0.5 block">
                      Bodyweight
                    </span>
                  )}
                </div>
              </div>

              {/* Previous completion metrics banner */}
              {prev ? (
                <div className="bg-[#F5F7F0] border border-black/5 p-3 rounded-[16px] text-xs flex justify-between items-center text-gray-700">
                  <span className="font-semibold text-gray-600 shrink-0">Last lift:</span>
                  <span className="font-mono text-right truncate pl-2 font-medium">{prev.summary} ({prev.date})</span>
                </div>
              ) : (
                <div className="border border-dashed border-black/10 p-2.5 rounded-[16px] text-[11px] text-center text-gray-400">
                  First lift in app. Smile & lift gentle!
                </div>
              )}

              {/* Set logging input columns */}
              <div className="flex flex-col gap-3 mt-1">
                {sets.map((setObj, sIdx) => {
                  const isChecked = setObj.completed;
                  return (
                    <div
                      id={`set-row-${ex.id}-${sIdx}`}
                      key={sIdx}
                      className={`flex items-center justify-between py-2.5 px-4 rounded-[16px] border transition-all ${
                        isChecked 
                          ? 'bg-[#E8EBDD] border-black/5 opacity-80' 
                          : 'bg-white border-black/5'
                      }`}
                    >
                      <span className="text-xs font-semibold text-gray-700 w-11 shrink-0">
                        Set {setObj.setNumber}
                      </span>

                      {/* Weight column */}
                      <div className="flex items-center gap-1.5 justify-center">
                        <input
                          id={`weight-input-${ex.id}-${sIdx}`}
                          type="number"
                          value={setObj.weight}
                          placeholder={ex.startingSuggestion > 0 ? String(ex.startingSuggestion) : "0"}
                          onChange={(e) => handleInputChange(ex.id, sIdx, 'weight', e.target.value)}
                          disabled={isChecked}
                          className="w-14 text-center text-xs py-1.5 px-2 bg-black/5 border-none rounded-md font-mono focus:ring-1 focus:ring-[#97A382] focus:outline-none"
                        />
                        <span className="text-[11px] text-gray-500">{units}</span>
                      </div>

                      {/* Reps column */}
                      <div className="flex items-center gap-1.5 justify-center">
                        <input
                          id={`reps-input-${ex.id}-${sIdx}`}
                          type="number"
                          value={setObj.reps}
                          placeholder={String(ex.repMax)}
                          onChange={(e) => handleInputChange(ex.id, sIdx, 'reps', e.target.value)}
                          disabled={isChecked}
                          className="w-12 text-center text-xs py-1.5 px-2 bg-black/5 border-none rounded-md font-mono focus:ring-1 focus:ring-[#97A382] focus:outline-none"
                        />
                        <span className="text-[11px] text-gray-500">reps</span>
                      </div>

                      {/* Done column */}
                      <button
                        id={`done-btn-${ex.id}-${sIdx}`}
                        onClick={() => handleToggleCompleted(ex.id, sIdx, ex.name, ex.restSeconds)}
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                          isChecked 
                            ? 'bg-black border-black text-white' 
                            : 'bg-white border-black/20 hover:border-black/50 text-transparent'
                        }`}
                        title={isChecked ? 'Mark Incomplete' : 'Complete set'}
                      >
                        <Check size={14} className={isChecked ? 'stroke-[3px]' : ''} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Rest timer trigger pill */}
              {ex.restSeconds > 0 && (
                <div className="flex justify-between items-center bg-[#F5F7F0] hover:bg-[#E8EBDD] p-3 rounded-[16px] border border-black/5 transition-colors">
                  <span className="text-xs font-semibold text-gray-600">
                    Rest suggestion: {ex.restSeconds}s
                  </span>
                  <button
                    id={`timer-shortcut-${ex.id}`}
                    onClick={() => handleManualTimer(ex.restSeconds)}
                    className="text-xs font-bold text-[#97A382] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Play size={11} className="fill-[#97A382]" /> Rest timer
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Workout Session Notes */}
      <div className="bg-white rounded-[32px] p-6 border border-black/5 shadow-sm flex flex-col gap-2 mt-2">
        <label htmlFor="notes-textarea" className="text-xs uppercase font-bold tracking-wider text-gray-500 flex items-center gap-1.5">
          <MessageSquare size={13} /> Helen’s Session Notes (Optional)
        </label>
        <textarea
          id="notes-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="For example: Felt excellent in Squats. Romanian Deadlifts are getting easier..."
          rows={2}
          className="w-full text-xs p-3 bg-black/5 border-none rounded-[16px] focus:ring-1 focus:ring-[#97A382] focus:outline-none"
        />
      </div>

      {/* Complete Button */}
      <div className="mt-4">
        <button
          id="save-session-btn"
          onClick={handleCompleteWorkout}
          className="w-full bg-black text-white hover:bg-black/95 font-semibold text-sm py-4.5 px-4 rounded-[24px] transition-all cursor-pointer text-center shadow-md active:scale-[0.99]"
        >
          Check off & Complete Workout
        </button>
      </div>
    </div>
  );
}
