import React, { useState, useEffect } from 'react';
import {
  getGeminiApiKey,
  saveGeminiApiKey,
  discoverBestModel,
  DEFAULT_HBS_GEMINI_KEY,
} from '../services/geminiService';
import { processOfflineQueue, getOfflineQueue } from '../services/offlineQueue';
import { useAuth } from '../context/AuthContext';
import { isKoenitzer, KOENITZER_PIN, MASTER_ADMIN_PIN } from '../data/teachers';
import {
  Settings,
  X,
  Key,
  Check,
  Sparkles,
  RefreshCw,
  Loader2,
  Database,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentTeacher } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [testedModel, setTestedModel] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Authorization state for Herr Könitzer T.
  const [unlockedByPin, setUnlockedByPin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const isAuthorized = isKoenitzer(currentTeacher) || unlockedByPin;

  useEffect(() => {
    if (isOpen) {
      setApiKey(getGeminiApiKey());
      setOfflineCount(getOfflineQueue().length);
      setPinInput('');
      setPinError(false);
      setTestError(null);
    }
  }, [isOpen, currentTeacher]);

  if (!isOpen) return null;

  const handleUnlockWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pinInput.trim();
    if (clean === KOENITZER_PIN || clean === MASTER_ADMIN_PIN) {
      setUnlockedByPin(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleSaveKey = () => {
    saveGeminiApiKey(apiKey.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleResetDefault = () => {
    if (confirm('Zentralen Standardschlüssel der Heimbürgeschule wiederherstellen?')) {
      setApiKey(DEFAULT_HBS_GEMINI_KEY);
      saveGeminiApiKey(DEFAULT_HBS_GEMINI_KEY);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) return;
    setIsTesting(true);
    setTestedModel(null);
    setTestError(null);
    try {
      const res = await discoverBestModel(apiKey.trim());
      setTestedModel(res.model);
    } catch (e: any) {
      setTestError(e?.message || 'Verbindung fehlgeschlagen. Bitte Key prüfen.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await processOfflineQueue();
      setOfflineCount(getOfflineQueue().length);
      alert(`Synchronisation abgeschlossen: ${res.synced} synchronisiert.`);
    } catch (e) {
      alert('Sync fehlgeschlagen.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-gray-800 text-base">
            <Settings className="w-5 h-5 text-[#0B7BA7]" />
            <span>Einstellungen & KI-Verbindung</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5 text-xs sm:text-sm">
          {/* Gemini API Key Section */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <label className="font-bold text-gray-900 flex items-center gap-1.5 text-sm">
                  <Key className="w-4 h-4 text-[#F39200]" /> Google Gemini API-Schlüssel
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  Versorgt den KI-Zauberstab, Projektcoach, die Generalprobe und Lehrerberichte.
                </p>
              </div>

              {isAuthorized ? (
                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Könitzer T. (Admin)</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Geschützt</span>
                </span>
              )}
            </div>

            {/* If NOT authorized: Masked view with unlock form */}
            {!isAuthorized ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-gray-700">
                  <span className="font-semibold">Aktueller Status:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Zentraler HBS-Schlüssel aktiv
                  </span>
                </div>

                {/* Masked display */}
                <div className="relative">
                  <input
                    type="password"
                    disabled
                    value="••••••••••••••••••••••••••••••••••••••••••••"
                    className="w-full p-2 bg-slate-200/70 border border-slate-300 rounded-lg text-xs font-mono text-gray-500 cursor-not-allowed select-none"
                  />
                  <div className="absolute right-2.5 top-2 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>

                <div className="text-[11px] text-gray-500 bg-white p-2.5 rounded-lg border border-slate-200 flex items-start gap-1.5 leading-relaxed">
                  <ShieldAlert className="w-4 h-4 text-[#F39200] shrink-0 mt-0.5" />
                  <span>
                    Der zentrale Schlüssel ist für alle Schüler und Kollegen betriebsbereit.
                    Einsicht, Test und Bearbeitung sind ausschließlich <strong>Herrn Könitzer T.</strong> vorbehalten.
                  </span>
                </div>

                {/* PIN Unlock form */}
                <form onSubmit={handleUnlockWithPin} className="pt-2 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-gray-700">
                      Als Herr Könitzer T. entsperren:
                    </span>
                    {pinError && (
                      <span className="text-[11px] font-bold text-red-600">
                        Falsche PIN!
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      maxLength={15}
                      value={pinInput}
                      onChange={(e) => {
                        setPinInput(e.target.value);
                        setPinError(false);
                      }}
                      placeholder="4-stellige PIN..."
                      className={`w-36 p-2 bg-white border rounded-xl text-xs font-mono focus:outline-none ${
                        pinError ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#0B7BA7]'
                      }`}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#0B7BA7] hover:bg-[#00558F] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Entsperren</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* If AUTHORIZED: Full administrative view */
              <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-900 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verwaltung freigeschaltet</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 hover:text-gray-900"
                  >
                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showKey ? 'Verbergen' : 'Klartext anzeigen'}</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="API-Schlüssel eingeben..."
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#0B7BA7] font-mono text-xs pr-10"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveKey}
                    className="flex-1 bg-[#0B7BA7] hover:bg-[#00558F] text-white py-2 px-3 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    {saveSuccess ? <Check className="w-3.5 h-3.5" /> : null}
                    <span>{saveSuccess ? 'Erfolgreich gesichert!' : 'Schlüssel speichern'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestKey}
                    disabled={isTesting || !apiKey}
                    className="bg-white hover:bg-slate-50 text-gray-800 py-2 px-3.5 rounded-xl font-bold text-xs border border-gray-300 transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                  >
                    {isTesting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0B7BA7]" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-[#F39200]" />
                    )}
                    <span>Verbindung prüfen</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetDefault}
                    className="p-2 text-gray-500 hover:text-gray-800 bg-white border border-gray-200 rounded-xl"
                    title="Auf offiziellen HBS-Standardschlüssel zurücksetzen"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {testedModel && (
                  <div className="text-xs bg-emerald-100/70 text-emerald-900 p-2.5 rounded-xl border border-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      Verbindung zu Google erfolgreich! Aktiviertes Modell: <strong>{testedModel}</strong>
                    </span>
                  </div>
                )}

                {testError && (
                  <div className="text-xs bg-red-100 text-red-900 p-2.5 rounded-xl border border-red-300 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Fehler beim Prüfen:</strong> {testError}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Offline Sync */}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <label className="font-bold text-gray-800 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#00A896]" /> Offline-Speicher & Synchronisation
            </label>
            <p className="text-xs text-gray-500">
              Warteschlange für lokale Änderungen ohne Internet: <strong>{offlineCount} Einträge</strong>
            </p>
            <button
              onClick={handleManualSync}
              disabled={isSyncing || offlineCount === 0}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-xl font-semibold text-xs border border-slate-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Jetzt synchronisieren</span>
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-300"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

