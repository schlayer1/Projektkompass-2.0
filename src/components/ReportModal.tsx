import React, { useState } from 'react';
import { ProjectBoard } from '../types/project';
import { X, Copy, Check, Mail, Share2 } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  board: ProjectBoard;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, board, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Trend Text-Chart erzeugen (analog zum Original)
  const getTrendTextChart = () => {
    if (!board.history || board.history.length === 0) return 'Keine Trend-Daten vorhanden.';
    let chart = '📈 PROJEKT-TREND (Fortschritt der letzten Tage):\n';
    chart += '---------------------------------------------------\n';

    board.history.forEach((h) => {
      const total = h.todo + h.inProgress + h.done;
      if (total === 0) return;
      const percentDone = Math.round((h.done / total) * 100);
      const barsDone = Math.round((h.done / total) * 10);
      const barStr = '█'.repeat(barsDone) + '░'.repeat(10 - barsDone);
      const dSplit = h.date.split('-');
      const dStr = dSplit.length === 3 ? `${dSplit[2]}.${dSplit[1]}.` : h.date;
      chart += `${dStr} | ${barStr} ${percentDone.toString().padStart(3, ' ')}% | ✅ ${h.done}  ⏳ ${h.inProgress}  📋 ${h.todo}\n`;
    });
    return chart;
  };

  const generateReportText = () => {
    const pName = board.projectName || 'Ohne Titel';
    const sName = board.studentName || 'Unbekannt';
    const tName = (board.teacherName || '').trim();
    const dateStr =
      new Date().toLocaleDateString('de-DE') +
      ' um ' +
      new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) +
      ' Uhr';

    let report = tName ? `Hallo ${tName},\n\n` : `Guten Tag,\n\n`;
    report += `anbei senden wir den aktuellen Statusbericht zu unserem Projekt "${pName}".\n`;
    report += `Wir hoffen, diese Übersicht gibt einen guten Einblick in unseren Arbeitsstand!\n\n`;

    report += `==========================================\n`;
    report += `🚀 STATUSBERICHT: ${pName}\n`;
    report += `👤 Gruppe/Von: ${sName}\n`;
    report += `📅 Stand: ${dateStr}\n`;
    report += `==========================================\n\n`;

    const needsHelp = board.tasks.filter((t) => t.needsHelp && t.status !== 'done');
    if (needsHelp.length > 0) {
      report += `🚨 HILFE BENÖTIGT BEI:\n${needsHelp
        .map((t) => `  - ${t.title}${t.blockerReason ? ` (Problem: ${t.blockerReason})` : ''}`)
        .join('\n')}\n\n`;
    }

    report += `⏳ IN ARBEIT:\n${
      board.tasks
        .filter((t) => t.status === 'in_progress')
        .map((t) => `  - ${t.title}`)
        .join('\n') || '  - (keine)'
    }\n\n`;

    report += `✅ ERLEDIGT:\n${
      board.tasks
        .filter((t) => t.status === 'done')
        .map((t) => `  - ${t.title}`)
        .join('\n') || '  - (keine)'
    }\n\n`;

    report += `📋 NOCH ZU TUN:\n${
      board.tasks
        .filter((t) => t.status === 'todo')
        .map((t) => `  - ${t.title}`)
        .join('\n') || '  - (alles erledigt!)'
    }\n\n`;

    const jG = (board.journalGood || '').trim();
    const jB = (board.journalBad || '').trim();
    const jN = (board.journalNext || '').trim();
    if (jG || jB || jN) {
      report += `📖 PROJEKT-TAGEBUCH:\n------------------------------------------\n`;
      if (jG) report += `👍 Lief gut: ${jG}\n`;
      if (jB) report += `🚧 War schwierig: ${jB}\n`;
      if (jN) report += `🎯 Nächstes Ziel: ${jN}\n`;
      report += `\n`;
    }

    report += getTrendTextChart();
    return report;
  };

  const reportText = generateReportText();

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendMail = () => {
    const pName = board.projectName || 'Projekt';
    const sName = board.studentName || '';
    const subject = encodeURIComponent(`Statusbericht: ${pName} ${sName ? `(${sName})` : ''}`);
    const body = encodeURIComponent(reportText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 bg-[#0B7BA7] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 font-bold text-base sm:text-lg">
            <Share2 className="w-5 h-5" />
            <span>Statusbericht für EduPage & Lehrkraft</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          <p className="text-xs sm:text-sm text-gray-600">
            Kopiere diesen formatierten Bericht mit einem Klick und sende ihn als Nachricht über{' '}
            <strong>EduPage</strong> an deine Lehrkraft.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs text-gray-800 whitespace-pre-wrap overflow-y-auto max-h-[45vh] shadow-inner">
            {reportText}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleCopy}
              className={`flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all border-2 ${
                copied
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                  : 'bg-white border-slate-300 text-gray-700 hover:bg-slate-50 shadow-sm'
              }`}
            >
              {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              <span>{copied ? 'In Zwischenablage kopiert!' : 'Text kopieren'}</span>
            </button>

            <button
              onClick={handleSendMail}
              className="flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#F39200] hover:bg-[#D97A09] shadow-sm transition-transform active:scale-95"
            >
              <Mail className="w-5 h-5" />
              <span>E-Mail öffnen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
