import React, { useState, useEffect } from 'react';
import { WorkoutPlan, WorkoutSession, AppSettings } from './types';
import { DEFAULT_WORKOUTS, DEFAULT_SETTINGS } from './data';
import Home from './components/Home';
import WorkoutDetail from './components/WorkoutDetail';
import HistoryList from './components/HistoryList';
import SettingsPanel from './components/SettingsPanel';
import RestTimer from './components/RestTimer';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell } from 'lucide-react';

const LOCAL_STORAGE_WORKOUTS_KEY = "helen_workout_plans_v1";
const LOCAL_STORAGE_SESSIONS_KEY = "helen_workout_sessions_v1";
const LOCAL_STORAGE_SETTINGS_KEY = "helen_workout_settings_v1";

export default function App() {
  // Navigation states
  const [activeView, setActiveView] = useState<'home' | 'history' | 'settings' | 'workout_detail'>('home');
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(null);

  // App core database states
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Global Floating Rest Timer states
  const [restDuration, setRestDuration] = useState<number>(0);
  const [timerKey, setTimerKey] = useState<number>(0);

  // Load from local storage on bootstrap
  useEffect(() => {
    // 1. Settings
    const storedSettings = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
      } catch (err) {
        setSettings(DEFAULT_SETTINGS);
      }
    } else {
      setSettings(DEFAULT_SETTINGS);
    }

    // 2. Workouts Plan
    const storedWorkouts = localStorage.getItem(LOCAL_STORAGE_WORKOUTS_KEY);
    if (storedWorkouts) {
      try {
        setWorkouts(JSON.parse(storedWorkouts));
      } catch (err) {
        setWorkouts(DEFAULT_WORKOUTS);
      }
    } else {
      setWorkouts(DEFAULT_WORKOUTS);
    }

    // 3. Logged Sessions
    const storedSessions = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
    if (storedSessions) {
      try {
        setSessions(JSON.parse(storedSessions));
      } catch (err) {
        setSessions([]);
      }
    } else {
      setSessions([]);
    }
  }, []);

  // Save states back to local storage
  const saveSettings = (updated: AppSettings) => {
    setSettings(updated);
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(updated));
  };

  const saveWorkouts = (updated: WorkoutPlan[]) => {
    setWorkouts(updated);
    localStorage.setItem(LOCAL_STORAGE_WORKOUTS_KEY, JSON.stringify(updated));
  };

  const saveSessions = (updated: WorkoutSession[]) => {
    setSessions(updated);
    localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(updated));
  };

  // Full hard data reset
  const handleClearAllData = () => {
    localStorage.removeItem(LOCAL_STORAGE_SETTINGS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_WORKOUTS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_SESSIONS_KEY);
    setSettings(DEFAULT_SETTINGS);
    setWorkouts(DEFAULT_WORKOUTS);
    setSessions([]);
    setActiveView('home');
    setSelectedWorkout(null);
    setRestDuration(0);
  };

  // Restore payload
  const handleImportData = (importObj: { settings: AppSettings; workouts: WorkoutPlan[] }) => {
    saveSettings(importObj.settings);
    saveWorkouts(importObj.workouts);
  };

  // Log set checkboxes rest timer auto-trigger
  const handleStartRestTimer = (seconds: number) => {
    setRestDuration(seconds);
    setTimerKey(Date.now()); // forces re-initialization of circle svg
  };

  // Add a newly completed session to logs database
  const handleSaveCompletedSession = (newSession: WorkoutSession) => {
    const nextSessions = [newSession, ...sessions];
    saveSessions(nextSessions);
  };

  // Handle single deletion from history list
  const handleDeleteSession = (sessionId: string) => {
    const updated = sessions.filter(s => s.id !== sessionId);
    saveSessions(updated);
  };

  // Quick navigation handlers
  const handleSelectWorkout = (plan: WorkoutPlan) => {
    setSelectedWorkout(plan);
    setActiveView('workout_detail');
  };

  const handleNavigateToView = (view: 'home' | 'history' | 'settings') => {
    setActiveView(view);
    setSelectedWorkout(null);
  };

  // Pastel Color Themes Map
  const bgThemeStyles: { [key in AppSettings['themeColor']]: string } = {
    sage: 'bg-[#d6e2d1]',
    mint: 'bg-[#dcf2e8]',
    olive: 'bg-[#e6e8d2]',
    eucalyptus: 'bg-[#cfdeda]'
  };

  // Loading safety fallbacks before states sync
  if (workouts.length === 0) {
    return (
      <div className="min-h-screen bg-[#d6e2d1] flex flex-col items-center justify-center text-black font-sans p-6 gap-2">
        <Dumbbell className="animate-spin text-black/50" size={32} />
        <span className="text-xs font-semibold tracking-wider uppercase opacity-40 mt-1">
          Loading Helen's App...
        </span>
      </div>
    );
  }

  return (
    <div id="app-root-wrapper" className={`min-h-screen w-full transition-colors duration-500 pb-16 font-sans ${bgThemeStyles[settings.themeColor]}`}>
      
      {/* Central iPhone constrained container */}
      <div id="iphone-viewport" className="w-full max-w-md mx-auto min-h-screen px-4 py-8 flex flex-col justify-start">
        
        {/* Navigation Core with Animation */}
        <AnimatePresence mode="wait">
          {activeView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <Home
                workouts={workouts}
                sessions={sessions}
                settings={settings}
                onSelectWorkout={handleSelectWorkout}
                onNavigateTo={handleNavigateToView}
              />
            </motion.div>
          )}

          {activeView === 'workout_detail' && selectedWorkout && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
            >
              <WorkoutDetail
                workout={selectedWorkout}
                sessions={sessions}
                units={settings.units}
                onSaveSession={handleSaveCompletedSession}
                onBack={() => handleNavigateToView('home')}
                onStartRestTimer={handleStartRestTimer}
              />
            </motion.div>
          )}

          {activeView === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
            >
              <HistoryList
                sessions={sessions}
                onBack={() => handleNavigateToView('home')}
                onDeleteSession={handleDeleteSession}
                workouts={workouts}
              />
            </motion.div>
          )}

          {activeView === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
            >
              <SettingsPanel
                settings={settings}
                workouts={workouts}
                onUpdateSettings={saveSettings}
                onUpdateWorkouts={saveWorkouts}
                onClearAllData={handleClearAllData}
                onImportData={handleImportData}
                onBack={() => handleNavigateToView('home')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global floating active rest timer overlay */}
        {restDuration > 0 && (
          <RestTimer
            key={timerKey}
            duration={restDuration}
            onComplete={() => setRestDuration(0)}
            onClose={() => setRestDuration(0)}
          />
        )}
      </div>
    </div>
  );
}
