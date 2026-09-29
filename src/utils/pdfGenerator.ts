import { jsPDF } from 'jspdf';
import { ComicData, ComicPanel } from '../types/comic';

export async function exportComicToPdf(comic: ComicData): Promise<string> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // -------------------------------------------------------------
  // PAGE 1: COVER PAGE
  // -------------------------------------------------------------
  // Background styling
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Comic border frame
  doc.setDrawColor(251, 191, 36); // amber-400
  doc.setLineWidth(1.5);
  doc.rect(margin - 4, margin - 4, contentWidth + 8, pageHeight - margin * 2 + 8);

  // Brand Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(251, 191, 36);
  doc.text('COMICCRAFT', pageWidth / 2, 45, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('AI COMIC STORY CREATOR', pageWidth / 2, 54, { align: 'center' });

  // Comic Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(comic.title || 'Comic Adventure', contentWidth - 20);
  doc.text(titleLines, pageWidth / 2, 75, { align: 'center' });

  // Cover Image (First panel image if available)
  if (comic.layout.length > 0 && comic.layout[0].image_url) {
    try {
      const coverUrl = comic.layout[0].image_url;
      const imgFormat = coverUrl.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(
        coverUrl,
        imgFormat,
        margin + 10,
        95,
        contentWidth - 20,
        90
      );
    } catch (e) {
      console.warn('Cover image render note:', e);
    }
  }

  // Metadata Card
  doc.setFillColor(30, 41, 59); // slate-800
  doc.roundedRect(margin + 5, 200, contentWidth - 10, 55, 3, 3, 'F');

  doc.setFontSize(11);
  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.text('COMIC DETAILS', margin + 12, 212);

  doc.setFontSize(9.5);
  doc.setTextColor(226, 232, 240);
  doc.setFont('helvetica', 'normal');
  doc.text(`Hero: ${comic.character_name || 'Hero'}`, margin + 12, 222);
  doc.text(`Setting: ${comic.setting}`, margin + 12, 230);
  doc.text(`Tone: ${comic.tone.toUpperCase()} | Art Style: ${comic.style.toUpperCase()}`, margin + 12, 238);
  doc.text(`Panels: ${comic.layout.length} Sequential Scenes`, margin + 12, 246);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Generated with ComicCraft AI using Gemini Models', pageWidth / 2, pageHeight - 12, { align: 'center' });

  // -------------------------------------------------------------
  // CONSECUTIVE PAGES: ONE PANEL PER PAGE (as per spec exporters.py)
  // -------------------------------------------------------------
  for (let i = 0; i < comic.layout.length; i++) {
    const panel = comic.layout[i];
    doc.addPage();

    // Dark comic background
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Comic Border frame
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(0.8);
    doc.rect(margin - 4, margin - 4, contentWidth + 8, pageHeight - margin * 2 + 8);

    // Panel Header (e.g. "Panel 1: The Forest's Edge")
    doc.setFillColor(239, 68, 68); // Red badge
    doc.roundedRect(margin, margin, 28, 8, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`PANEL ${panel.panel}`, margin + 14, margin + 5.5, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(panel.title || `Panel ${panel.panel}`, margin + 34, margin + 6);

    // Panel Image placement (y_image = 32, height = 95)
    const yImage = margin + 12;
    const imgHeight = 92;
    if (panel.image_url) {
      try {
        const imgFormat = panel.image_url.includes('image/png') ? 'PNG' : 'JPEG';
        doc.addImage(
          panel.image_url,
          imgFormat,
          margin,
          yImage,
          contentWidth,
          imgHeight
        );
      } catch (err) {
        console.warn('Image addition error in PDF:', err);
      }
    }

    // Border around image
    doc.setDrawColor(251, 191, 36);
    doc.setLineWidth(0.6);
    doc.rect(margin, yImage, contentWidth, imgHeight);

    // Text Placement below image
    let currentY = yImage + imgHeight + 8;

    // 1. Scene Description (in italics)
    if (panel.scene_description) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(148, 163, 184); // slate-400
      const descLines = doc.splitTextToSize(panel.scene_description, contentWidth);
      doc.text(descLines, margin, currentY);
      currentY += descLines.length * 4.8 + 5;
    }

    // 2. Caption box
    if (panel.caption) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(251, 191, 36); // amber
      doc.text('**CAPTION**', margin, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(226, 232, 240);
      const capLines = doc.splitTextToSize(panel.caption, contentWidth - 25);
      doc.text(capLines, margin + 25, currentY);
      currentY += Math.max(capLines.length * 4.5, 6) + 4;
    }

    // 3. Narration box
    if (panel.narration) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(56, 189, 248); // sky blue
      doc.text('**NARRATION**', margin, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(241, 245, 249);
      const narLines = doc.splitTextToSize(panel.narration, contentWidth - 30);
      doc.text(narLines, margin + 30, currentY);
      currentY += Math.max(narLines.length * 4.5, 6) + 5;
    }

    // 4. Character Dialogue
    if (panel.dialogue) {
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(251, 191, 36);
      doc.text('DIALOGUE:', margin + 4, currentY + 6);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      const dialLines = doc.splitTextToSize(panel.dialogue, contentWidth - 28);
      doc.text(dialLines, margin + 26, currentY + 6);
      currentY += 18;
    }

    // 5. Image Prompt Reference (as explicitly noted in Activity 4.1 / Page 23)
    if (panel.image_prompt) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('**IMAGE PROMPT**', margin, currentY + 3);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      const promptLines = doc.splitTextToSize(panel.image_prompt, contentWidth - 32);
      doc.text(promptLines, margin + 32, currentY + 3);
    }

    // Page indicator
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${i + 2} of ${comic.layout.length + 1}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  // Timestamp filename matching exporters.py: `f"comic_{timestamp}.pdf"`
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:T]/g, '')
    .slice(0, 14);
  const cleanChar = (comic.character_name || 'comic').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `comic_${cleanChar}_${timestamp}.pdf`;

  doc.save(filename);
  return filename;
}
