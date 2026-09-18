import React from 'react';
import { ProjectBoard } from '../types/project';

interface PrintableProjectReportProps {
  board: ProjectBoard;
}

export const PrintableProjectReport: React.FC<PrintableProjectReportProps> = ({ board }) => {
  const doneTasks = board.tasks.filter((t) => t.status === 'done');
  const inProgTasks = board.tasks.filter((t) => t.status === 'in_progress');
  const todoTasks = board.tasks.filter((t) => t.status === 'todo');

  const total = board.tasks.length;
  const percentDone = total > 0 ? Math.round((doneTasks.length / total) * 100) : 0;
  const isGrad10 = board.projectType === 'grad10';

  return (
    <div
      id="pdf-printable-project"
      className="bg-white text-gray-900 p-8 font-sans max-w-4xl mx-auto"
      style={{ minHeight: '297mm' }}
    >
      {/* Header */}
      <div className="flex justify-between items-center border-b-4 border-[#0B7BA7] pb-4 mb-6">
        <div className="flex items-center gap-4">
          <img
            src="/Siegel_bunt.png"
            alt="Siegel Heimbürgeschule"
            className="w-16 h-16 object-contain rounded-full border-2 border-[#0B7BA7] p-1"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0B7BA7] tracking-tight">
              {isGrad10
                ? 'Abschlussarbeit Jahrgang 10: Dokumentation des Arbeitsprozesses'
                : 'Projektbericht & Nachweis'}
            </h1>
            <p className="text-xs font-bold text-[#F39200]">
              Staatliche Regelschule »Heimbürgeschule« Kahla • Thüringen
            </p>
          </div>
        </div>

        <div className="text-right text-xs text-gray-600">
          <div><strong>Schuljahr:</strong> {board.schoolYear || 'Aktuell'}</div>
          <div><strong>Erstellt am:</strong> {new Date().toLocaleDateString('de-DE')}</div>
        </div>
      </div>

      {/* Meta Box */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-xs">
        <div>
          <span className="text-gray-500 font-bold uppercase block text-[10px]">Thema / Titel</span>
          <strong className="text-gray-900 text-sm">{board.projectName || 'Ohne Titel'}</strong>
        </div>
        <div>
          <span className="text-gray-500 font-bold uppercase block text-[10px]">Gruppe / Name</span>
          <strong className="text-gray-900 text-sm">{board.studentName || 'Unbekannt'}</strong>
        </div>
        <div>
          <span className="text-gray-500 font-bold uppercase block text-[10px]">Klasse & Fach</span>
          <strong className="text-gray-900 text-sm">{board.studentClass} {board.subject ? `• ${board.subject}` : ''}</strong>
        </div>
        <div>
          <span className="text-gray-500 font-bold uppercase block text-[10px]">Betreuende Lehrkraft</span>
          <strong className="text-gray-900 text-sm">{board.teacherName || '—'}</strong>
        </div>
      </div>

      {/* Group Members */}
      {board.groupMembers && board.groupMembers.length > 0 && (
        <div className="mb-6 p-3 bg-sky-50/50 border border-sky-200 rounded-xl text-xs">
          <strong className="text-sky-900 block uppercase text-[10px] mb-1">
            Beteiligte Schülerinnen und Schüler (Gruppenmitglieder):
          </strong>
          <div className="flex flex-wrap gap-2 text-gray-800 font-semibold">
            {board.groupMembers.map((m, idx) => (
              <span key={idx} className="bg-white px-2.5 py-1 rounded-md border border-sky-200">
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Timeline & Meilensteine */}
      {board.milestones && board.milestones.length > 0 && (
        <div className="mb-6">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-800 border-b pb-1 mb-2">
            1. Meilensteine & Zeitplan
          </h3>
          <table className="w-full text-xs text-left border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-gray-700 font-bold">
              <tr>
                <th className="p-2">Etappe / Meilenstein</th>
                <th className="p-2 w-28">Frist</th>
                <th className="p-2 w-28">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {board.milestones.map((m) => (
                <tr key={m.id} className={m.completed ? 'bg-emerald-50/30' : ''}>
                  <td className="p-2 font-medium">
                    {m.title}
                    {m.description && <span className="block text-[10px] text-gray-500">{m.description}</span>}
                  </td>
                  <td className="p-2 text-gray-600">
                    {m.dueDate ? new Date(m.dueDate).toLocaleDateString('de-DE') : '—'}
                  </td>
                  <td className="p-2">
                    {m.completed ? (
                      <span className="text-emerald-700 font-bold">✅ Eingehalten</span>
                    ) : (
                      <span className="text-gray-500">Offen</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Konsultationen (Jahrgang 10) */}
      {isGrad10 && board.consultations && board.consultations.length > 0 && (
        <div className="mb-6">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-800 border-b pb-1 mb-2">
            2. Beratungs- & Konsultationsprotokolle (Prozessbeleg)
          </h3>
          <div className="space-y-3">
            {board.consultations.map((c, idx) => (
              <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <div className="flex justify-between items-center font-bold text-gray-900 border-b pb-1 mb-1">
                  <span>Konsultation {(board.consultations?.length || 0) - idx}: {new Date(c.date).toLocaleDateString('de-DE')}</span>
                  <span className="text-gray-600 font-normal">Anwesend: {c.attendees.join(', ') || 'Alle'}</span>
                </div>
                <div className="text-gray-800 mt-1">
                  <strong>Themen:</strong> {c.topics}
                </div>
                {c.nextSteps && (
                  <div className="text-[#0B7BA7] mt-0.5">
                    <strong>Nächste Schritte:</strong> {c.nextSteps}
                  </div>
                )}
                {c.teacherNotes && (
                  <div className="text-amber-900 italic mt-0.5">
                    <strong>Betreuernotiz:</strong> {c.teacherNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aufgabenübersicht */}
      <div className="mb-6">
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-800 border-b pb-1 mb-2">
          {isGrad10 ? '3. Aufgaben & individuelle Leistungsanteile' : '2. Aufgaben & Arbeitsschritte'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Erledigt */}
          <div className="border p-3 rounded-lg bg-slate-50/50">
            <h4 className="font-bold text-emerald-800 mb-2">✅ Erledigte Aufgaben ({doneTasks.length})</h4>
            <ul className="space-y-1.5 pl-1">
              {doneTasks.map((t) => (
                <li key={t.id} className="border-l-2 border-emerald-500 pl-1.5">
                  <strong>{t.title}</strong>
                  {t.assignee && <span className="text-gray-500 text-[10px] ml-1">({t.assignee})</span>}
                </li>
              ))}
            </ul>
          </div>

          {/* In Arbeit & Offen */}
          <div className="border p-3 rounded-lg bg-slate-50/50">
            <h4 className="font-bold text-[#0B7BA7] mb-2">⏳ In Arbeit & Offen ({inProgTasks.length + todoTasks.length})</h4>
            <ul className="space-y-1.5 pl-1">
              {[...inProgTasks, ...todoTasks].map((t) => (
                <li key={t.id} className="border-l-2 border-[#0B7BA7] pl-1.5">
                  <span>{t.title}</span>
                  {t.assignee && <span className="text-gray-500 text-[10px] ml-1">({t.assignee})</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Reflexionstagebuch */}
      {(board.journalGood || board.journalBad || board.journalNext) && (
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-800 border-b pb-1 mb-2">
            📖 Reflexion & Metakognition der Gruppe
          </h3>
          <div className="space-y-1.5">
            {board.journalGood && (
              <div><strong className="text-emerald-700">Gut gelaufen:</strong> {board.journalGood}</div>
            )}
            {board.journalBad && (
              <div><strong className="text-amber-700">Schwierigkeiten:</strong> {board.journalBad}</div>
            )}
            {board.journalNext && (
              <div><strong className="text-[#0B7BA7]">Weiteres Vorgehen:</strong> {board.journalNext}</div>
            )}
          </div>
        </div>
      )}

      {/* Lehrkraft-Rückmeldung & Unterschriftenfeld */}
      <div className="mt-8 pt-4 border-t-2 border-slate-200 text-xs">
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-600 mb-2">
          Pädagogische Gesamtbeurteilung des Arbeitsprozesses
        </h3>
        <div className="min-h-[60px] bg-slate-50 border border-slate-200 rounded-lg p-3 text-gray-800 mb-8 italic">
          {board.teacherNotes || 'Handschriftliche Notizen des Betreuers zur Notengebung:'}
        </div>

        <div className="grid grid-cols-2 gap-8 text-xs text-gray-600 pt-6">
          <div className="border-t border-gray-400 text-center pt-1">
            Datum / Unterschrift Gruppenmitglieder
          </div>
          <div className="border-t border-gray-400 text-center pt-1">
            Datum / Unterschrift betreuende Fachlehrkraft
          </div>
        </div>
      </div>
    </div>
  );
};
