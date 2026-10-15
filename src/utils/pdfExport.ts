import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { PaperSize, PageOrientation } from '../types/gspa';

export interface ExportPdfOptions {
  elementId: string;
  filename: string;
  paperSize?: PaperSize;
  orientation?: PageOrientation;
  onProgress?: (status: string) => void;
}

export async function exportElementToPdf({
  elementId,
  filename,
  paperSize = 'letter',
  orientation = 'portrait',
  onProgress,
}: ExportPdfOptions): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found.`);
  }

  try {
    onProgress?.('Preparing high-resolution document canvas...');

    // Save scroll position
    const originalScrollTop = window.scrollY;
    window.scrollTo(0, 0);

    // Create high-resolution render (scale 2 gives ~300 DPI sharpness)
    const canvas = await html2canvas(element, {
      scale: 2.2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        const clonedEl = clonedDoc.getElementById(elementId);
        if (clonedEl) {
          // Ensure backgrounds and sharp borders are preserved
          clonedEl.style.boxShadow = 'none';
          clonedEl.style.margin = '0 auto';
        }
      },
    });

    onProgress?.('Generating PDF pages...');

    // Paper dimensions in mm
    // Letter: 215.9 x 279.4 mm
    // A4: 210 x 297 mm
    const isA4 = paperSize === 'a4';
    const isLandscape = orientation === 'landscape';

    const pageWidth = isLandscape ? (isA4 ? 297 : 279.4) : (isA4 ? 210 : 215.9);
    const pageHeight = isLandscape ? (isA4 ? 210 : 215.9) : (isA4 ? 297 : 279.4);

    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: isA4 ? 'a4' : 'letter',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Calculate aspect ratio
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Check if single page fits or if multi-page needed
    if (imgHeight <= pageHeight + 5) {
      // Single page document
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
    } else {
      // Multi-page document handling
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 5) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    }

    onProgress?.('Finalizing and downloading...');
    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);

    // Restore scroll position
    window.scrollTo(0, originalScrollTop);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}

export function triggerNativePrint(): void {
  window.print();
}
