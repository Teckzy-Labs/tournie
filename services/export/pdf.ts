import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export async function exportBracketToPDF(element: HTMLElement, tournamentName?: string) {
  try {
    const imgData = await toPng(element, {
      cacheBust: true,
      quality: 1,
      pixelRatio: 2
    });

    const img = new window.Image();
    img.onload = () => {
      const pdf = new jsPDF({
        orientation: img.width > img.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [img.width, img.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, img.width, img.height);
      pdf.save(`${tournamentName || 'Tournament'}_Bracket.pdf`);
    };
    img.src = imgData;
  } catch (error) {
    console.error('Error exporting PDF:', error);
  }
}
