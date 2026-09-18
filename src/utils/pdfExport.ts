// @ts-ignore
import html2pdf from 'html2pdf.js';
import confetti from 'canvas-confetti';
import { ProjectBoard } from '../types/project';

export async function exportProjectToPDF(board: ProjectBoard): Promise<void> {
  const element = document.getElementById('pdf-printable-project');
  if (!element) {
    window.print();
    return;
  }

  const cleanName = (board.projectName || 'Projekt')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-äöüÄÖÜß]/g, '');
  const cleanGroup = (board.studentName || 'Gruppe')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-äöüÄÖÜß]/g, '');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `Projektbericht_${cleanName}_${cleanGroup}_${dateStr}.pdf`;

  const opt = {
    margin: [8, 8, 8, 8],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    html2canvas: {
      scale: 2,
      useCORS: true,
      scrollY: 0,
      scrollX: 0,
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  try {
    await html2pdf().set(opt).from(element).save();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0B7BA7', '#00A896', '#F39200', '#00558F'],
      });
    } catch (e) {}
  } catch (err) {
    console.warn('html2pdf fehlgeschlagen, nutze Fallback window.print():', err);
    window.print();
  }
}
