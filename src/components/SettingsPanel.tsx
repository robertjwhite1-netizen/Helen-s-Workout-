import React, { useState } from 'react';
import { AppSettings, WorkoutPlan, Exercise } from '../types';
import { ChevronLeft, Edit2, Plus, Trash2, RotateCcw, Download, Upload, Check, ChevronDown, AlertTriangle } from 'lucide-react';
import { DEFAULT_WORKOUTS } from '../data';

interface SettingsPanelProps {
  settings: AppSettings;
  workouts: WorkoutPlan[];
  onUpdateSettings: (settings: AppSettings) => void;
  onUpdateWorkouts: (workouts: WorkoutPlan[]) => void;
  onClearAllData: () => void;
  onImportData: (importObj: { settings: AppSettings; workouts: WorkoutPlan[] }) => void;
  onBack: () => void;
}

export default function SettingsPanel({
  settings,
  workouts,
  onUpdateSettings,
  onUpdateWorkouts,
  onClearAllData,
  onImportData,
  onBack
}: SettingsPanelProps) {
  // Navigation tabs or collapsible states
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  
  // Local state edit fields
  const [editingExercise, setEditingExercise] = useState<{ workoutId: string; exId: string } | null>(null);
  const [eName, setEName] = useState('');
  const [eSuggestWeight, setESuggestWeight] = useState(0);
  const [eRest, setERest] = useState(60);
  
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  const toggleAccordion = (name: string) => {
    setActiveAccordion(activeAccordion === name ? null : name);
  };

  const handleUpdateUserName = (name: string) => {
    onUpdateSettings({ ...settings, userName: name });
  };

  const handleUpdateUnits = (units: 'kg' | 'lbs') => {
    onUpdateSettings({ ...settings, units });
  };

  const handleUpdateTheme = (themeColor: 'sage' | 'mint' | 'olive' | 'eucalyptus') => {
    onUpdateSettings({ ...settings, themeColor });
  };

  // Edit Workout days input
  const handleUpdateDay = (planId: string, newDay: string) => {
    const updated = workouts.map(w => {
      if (w.id === planId) {
        return { ...w, day: newDay };
      }
      return w;
    });
    onUpdateWorkouts(updated);
  };

  // Start editing individual exercise values
  const startEditingExercise = (workoutId: string, ex: Exercise) => {
    setEditingExercise({ workoutId, exId: ex.id });
    setEName(ex.name);
    setESuggestWeight(ex.startingSuggestion);
    setERest(ex.restSeconds);
  };

  // Save exercise modifications
  const saveExerciseEdit = (workoutId: string, exId: string) => {
    if (eName.trim() === '') return;

    const updatedWorkouts = workouts.map(w => {
      if (w.id === workoutId) {
        return {
          ...w,
          exercises: w.exercises.map(ex => {
            if (ex.id === exId) {
              return {
                ...ex,
                name: eName.trim(),
                startingSuggestion: Number(eSuggestWeight) || 0,
                restSeconds: Number(eRest) || 0
              };
            }
            return ex;
          })
        };
      }
      return w;
    });

    onUpdateWorkouts(updatedWorkouts);
    setEditingExercise(null);
  };

  // Reset whole default workout configuration
  const handleResetWorkouts = () => {
    if (confirm("Are you sure Helen wants to reset all plans and exercise names back to starting defaults? This will overwrite individual starting suggests.")) {
      onUpdateWorkouts(DEFAULT_WORKOUTS);
    }
  };

  // Data Export utils
  const handleBackupExport = () => {
    const backupObj = {
      settings,
      workouts,
      version: "1.0",
      exportDate: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(backupObj, null, 2);
    
    // Download as file
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `helen_workout_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Data Import utils
  const handleBackupImport = () => {
    setImportError('');
    setImportSuccess(false);

    if (importJsonText.trim() === '') {
      setImportError('Please paste your previously exported JSON backup data inside the form box.');
      return;
    }

    try {
      const parsed = JSON.parse(importJsonText.trim());
      if (!parsed.settings || !parsed.workouts) {
        setImportError('Invalid backup layout. It must contain complete "settings" and "workouts" keys.');
        return;
      }

      onImportData({
        settings: parsed.settings,
        workouts: parsed.workouts
      });

      setImportSuccess(true);
      setImportJsonText('');
    } catch (err: any) {
      setImportError(`Failed parsing backup JSON configuration: ${err.message || err}`);
    }
  };

  return (
    <div id="settings-view" className="flex flex-col gap-4 w-full animate-in fade-in duration-300">
      
      {/* Header with back */}
      <div className="flex items-center justify-between">
        <button
          id="settings-back-btn"
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-[#97A382] py-2 px-4 rounded-full bg-white hover:bg-white/80 border border-black/5 transition-all cursor-pointer shadow-xs"
        >
          <ChevronLeft size={14} /> Back
        </button>
        <span className="text-xs font-semibold text-gray-500 bg-white border border-black/5 px-3 py-1.5 rounded-full">
          Preferences
        </span>
      </div>

      <div className="pl-1">
        <h1 className="text-2xl font-semibold tracking-tight text-black">
          App Settings
        </h1>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
          Modify Helen's plan, affirmations & variables.
        </p>
      </div>

      {/* Accordion Panels */}
      <div className="flex flex-col gap-4 mt-2">
        
        {/* TAB 1: Profile & Theme */}
        <div className="bg-white rounded-[32px] border border-black/5 overflow-hidden shadow-sm">
          <div
            id="accordion-trigger-profile"
            onClick={() => toggleAccordion('profile')}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/50"
          >
            <div className="flex flex-col">
              <span className="font-medium text-black">Profile & Preferences</span>
              <span className="text-[11px] text-gray-500">Name, units, and custom theme overrides</span>
            </div>
            <ChevronDown size={16} className={`text-black/40 transition-transform ${activeAccordion === 'profile' ? 'rotate-180' : ''}`} />
          </div>

          {activeAccordion === 'profile' && (
            <div className="p-5 bg-[#F5F7F0] border-t border-black/5 flex flex-col gap-4 animate-in fade-in">
              {/* User Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Owner Name</label>
                <input
                  id="user-name-input"
                  type="text"
                  value={settings.userName}
                  onChange={(e) => handleUpdateUserName(e.target.value)}
                  className="w-full text-xs p-3 bg-white border border-black/5 rounded-[16px] focus:ring-1 focus:ring-[#97A382] focus:outline-none font-medium"
                />
              </div>

              {/* Units Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Measurement Units</label>
                <div className="grid grid-cols-2 gap-2 bg-white/50 p-1 rounded-[16px] border border-black/5">
                  <button
                    id="unit-kg-btn"
                    onClick={() => handleUpdateUnits('kg')}
                    className={`py-2 px-3 rounded-[12px] text-xs font-semibold cursor-pointer transition-all ${settings.units === 'kg' ? 'bg-[#97A382] text-white shadow-sm font-bold' : 'text-gray-600 hover:text-black'}`}
                  >
                    Metric (kg)
                  </button>
                  <button
                    id="unit-lbs-btn"
                    onClick={() => handleUpdateUnits('lbs')}
                    className={`py-2 px-3 rounded-[12px] text-xs font-semibold cursor-pointer transition-all ${settings.units === 'lbs' ? 'bg-[#97A382] text-white shadow-sm font-bold' : 'text-gray-600 hover:text-black'}`}
                  >
                    Imperial (lbs)
                  </button>
                </div>
              </div>

              {/* Theme selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Calming Color Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['sage', 'mint', 'olive', 'eucalyptus'] as const).map((col) => (
                    <button
                      id={`theme-btn-${col}`}
                      key={col}
                      onClick={() => handleUpdateTheme(col)}
                      className={`py-2 px-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                        settings.themeColor === col 
                          ? 'bg-[#97A382] text-white border-transparent shadow-sm' 
                          : 'bg-white text-black border-black/5 hover:border-black/20'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TAB 2: Workout Program Days */}
        <div className="bg-white rounded-[32px] border border-black/5 overflow-hidden shadow-sm">
          <div
            id="accordion-trigger-days"
            onClick={() => toggleAccordion('days')}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/50"
          >
            <div className="flex flex-col">
              <span className="font-medium text-black">Workout Routine Days</span>
              <span className="text-[11px] text-gray-500">Adjust weekdays scheduled for workouts</span>
            </div>
            <ChevronDown size={16} className={`text-black/40 transition-transform ${activeAccordion === 'days' ? 'rotate-180' : ''}`} />
          </div>

          {activeAccordion === 'days' && (
            <div className="p-5 bg-[#F5F7F0] border-t border-black/5 space-y-3 animate-in fade-in">
              <p className="text-xs text-gray-600 leading-relaxed">
                Change the target weekdays on Helen’s main program cards. Keep them simple & predictable!
              </p>
              
              <div className="space-y-2.5">
                {workouts.map((w) => (
                  <div id={`day-edit-row-${w.id}`} key={w.id} className="flex justify-between items-center gap-3 bg-white p-3 border border-black/5 rounded-[16px] text-xs">
                    <span className="font-semibold text-black">{w.name} code</span>
                    <input
                      id={`day-input-${w.id}`}
                      type="text"
                      value={w.day}
                      onChange={(e) => handleUpdateDay(w.id, e.target.value)}
                      className="w-28 text-center text-xs p-2 bg-[#F5F7F0] border border-black/5 rounded-lg focus:ring-1 focus:ring-[#97A382] font-semibold"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* TAB 3: Edit Exercises Details */}
        <div className="bg-white rounded-[32px] border border-black/5 overflow-hidden shadow-sm">
          <div
            id="accordion-trigger-exercises"
            onClick={() => toggleAccordion('exercises')}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/50"
          >
            <div className="flex flex-col">
              <span className="font-medium text-black">Exercise Catalog overrides</span>
              <span className="text-[11px] text-gray-500">Edit names, starting weights & rest recovery timers</span>
            </div>
            <ChevronDown size={16} className={`text-black/40 transition-transform ${activeAccordion === 'exercises' ? 'rotate-180' : ''}`} />
          </div>

          {activeAccordion === 'exercises' && (
            <div className="p-5 bg-[#F5F7F0] border-t border-black/5 space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center bg-white/50 p-2.5 rounded-[16px] border border-black/5">
                <span className="text-xs text-gray-600 pl-1 font-medium">Reset program overrides:</span>
                <button
                  id="reset-workout-rules"
                  onClick={handleResetWorkouts}
                  className="text-[10px] font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/50 py-1.5 px-3 rounded-lg cursor-pointer flex items-center gap-1 transition-all"
                >
                  <RotateCcw size={11} /> Reset Program
                </button>
              </div>

              {workouts.map((plan) => (
                <div id={`settings-workout-block-${plan.id}`} key={plan.id} className="border-t border-black/5 pt-3">
                  <h4 className="text-xs uppercase font-bold tracking-widest text-[#97A382] mb-3">
                    {plan.name} ({plan.day})
                  </h4>

                  <div className="space-y-3">
                    {plan.exercises.map((ex) => {
                      const isEditing = editingExercise?.workoutId === plan.id && editingExercise?.exId === ex.id;
                      return (
                        <div id={`settings-ex-card-${ex.id}`} key={ex.id} className="bg-white p-4 border border-black/5 rounded-[24px] flex flex-col gap-2 shadow-xs">
                          
                          {!isEditing ? (
                            <div className="flex justify-between items-center text-xs">
                              <div>
                                <span className="font-semibold text-black text-sm">{ex.name}</span>
                                <span className="text-[11px] text-gray-500 block mt-1 leading-normal">
                                  Default Suggestion: {ex.startingSuggestion}{settings.units} | Recovery rest: {ex.restSeconds}s
                                </span>
                              </div>
                              <button
                                id={`edit-ex-toggle-${ex.id}`}
                                onClick={() => startEditingExercise(plan.id, ex)}
                                className="p-2 hover:bg-black/5 text-[#97A382] rounded-full cursor-pointer transition-all shrink-0"
                                title="Edit parameters"
                              >
                                <Edit2 size={13} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3 p-1 animate-in fade-in duration-100">
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Exercise Name</label>
                                <input
                                  id={`edit-ex-name-${ex.id}`}
                                  type="text"
                                  value={eName}
                                  onChange={(e) => setEName(e.target.value)}
                                  className="w-full text-xs p-2.5 bg-[#F5F7F0] border border-black/5 rounded-lg focus:ring-1 focus:ring-[#97A382] font-semibold"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Suggested Weight ({settings.units})</label>
                                  <input
                                    id={`edit-ex-wt-${ex.id}`}
                                    type="number"
                                    value={eSuggestWeight}
                                    onChange={(e) => setESuggestWeight(Number(e.target.value) || 0)}
                                    className="w-full text-xs p-2.5 bg-[#F5F7F0] border border-black/5 rounded-lg focus:ring-1 focus:ring-[#97A382] font-mono font-bold"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Rest Timer (seconds)</label>
                                  <input
                                    id={`edit-ex-rest-${ex.id}`}
                                    type="number"
                                    value={eRest}
                                    onChange={(e) => setERest(Number(e.target.value) || 0)}
                                    className="w-full text-xs p-2.5 bg-[#F5F7F0] border border-black/5 rounded-lg focus:ring-1 focus:ring-[#97A382] font-mono font-bold"
                                  />
                                </div>
                              </div>

                              <div className="flex gap-2 justify-end mt-1">
                                <button
                                  id={`cancel-ex-edit-${ex.id}`}
                                  onClick={() => setEditingExercise(null)}
                                  className="text-[11px] py-1.5 px-3 rounded-lg border border-black/10 hover:bg-black/5 cursor-pointer font-medium"
                                >
                                  Cancel
                                </button>
                                <button
                                  id={`save-ex-edit-${ex.id}`}
                                  onClick={() => saveExerciseEdit(plan.id, ex.id)}
                                  className="text-[11px] font-bold py-1.5 px-4 rounded-lg bg-[#97A382] text-white hover:bg-[#97A382]/90 cursor-pointer flex items-center gap-1 shadow-xs"
                                >
                                  <Check size={11} /> Save
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TAB 5: Data Backup / Restore */}
        <div className="bg-white rounded-[32px] border border-black/5 overflow-hidden shadow-sm">
          <div
            id="accordion-trigger-backup"
            onClick={() => toggleAccordion('backup')}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/50"
          >
            <div className="flex flex-col">
              <span className="font-medium text-black">Backup, Restore & Reset Data</span>
              <span className="text-[11px] text-gray-500">Export backup document or purge web storage</span>
            </div>
            <ChevronDown size={16} className={`text-black/40 transition-transform ${activeAccordion === 'backup' ? 'rotate-180' : ''}`} />
          </div>

          {activeAccordion === 'backup' && (
            <div className="p-5 bg-[#F5F7F0] border-t border-black/5 space-y-4 animate-in fade-in">
              
              {/* Export backup file */}
              <div className="space-y-1.5">
                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-0.5">Backup Local State</h5>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Save all completed logs and settings to a JSON file on Helen’s device to keep records secure.
                </p>
                <button
                  id="export-backup-btn"
                  onClick={handleBackupExport}
                  className="w-full bg-white hover:bg-white/80 border border-black/5 text-[#97A382] font-bold text-xs py-3 px-4 rounded-[24px] cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all"
                >
                  <Download size={14} /> Export Backup (.json)
                </button>
              </div>

              {/* Import backup payload */}
              <div className="border-t border-black/5 pt-4 space-y-2">
                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-0.5">Restore Data from Backup</h5>
                <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                  Paste the content of a previously exported `.json` file here to instantly sync logs.
                </p>
                <textarea
                  id="import-backup-textarea"
                  rows={3}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder='Paste backup JSON text here...'
                  className="w-full text-xs p-3 bg-white border border-black/5 rounded-[16px] font-mono placeholder:text-gray-400 focus:outline-none"
                />

                {importError && (
                  <p className="text-[11px] font-semibold text-red-700 bg-red-50 p-3 rounded-[16px] border border-red-100 flex items-start gap-1">
                    <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                    <span>{importError}</span>
                  </p>
                )}

                {importSuccess && (
                  <p className="text-[11px] font-semibold text-green-800 bg-green-50 p-3 rounded-[16px] border border-green-100 flex items-start gap-1">
                    <Check size={12} className="shrink-0 mt-0.5" />
                    <span>Backup restored successfully! All layouts synchronized.</span>
                  </p>
                )}

                <button
                  id="import-backup-btn"
                  onClick={handleBackupImport}
                  className="w-full bg-[#97A382] text-white hover:bg-[#97A382]/90 font-bold text-xs py-3 px-4 rounded-[24px] cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all"
                >
                  <Upload size={14} /> Import Backup Content
                </button>
              </div>

              {/* Hard erase */}
              <div className="border-t border-red-100 pt-4 space-y-2.5">
                <h5 className="text-xs font-bold text-red-700 uppercase tracking-widest pl-0.5 flex items-center gap-1">
                  <AlertTriangle size={14} /> Erase All Storage
                </h5>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  This deletes Helen’s complete history database and customs settings. This action is irreversible.
                </p>
                <button
                  id="dev-clear-storage-btn"
                  onClick={() => {
                    if (confirm("DANGER: This will permanently wipe out all completed history entries and customized workouts for Helen. Do you want to proceed?")) {
                      onClearAllData();
                      alert("Web Storage purged successfully.");
                    }
                  }}
                  className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs py-3 px-4 rounded-[24px] cursor-pointer transition-colors"
                >
                  Reset App & Wipes everything
                </button>
              </div>

            </div>
          )}
        </div>

      </div>

      <div className="text-center mt-3 text-xs text-gray-500">
        Helen’s Path • Version 1.0.0
      </div>
    </div>
  );
}
