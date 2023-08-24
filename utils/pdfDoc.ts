import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

export const setFont = async (
  pdfDoc: PDFDocument,
  fontPath: string
): Promise<PDFFont> => {
  const fontBytes = await fetch(fontPath).then((res) => res.arrayBuffer());
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fontBytes);
  return font;
};

export const drawTextCenter = (
  page: PDFPage,
  font: PDFFont,
  text: string,
  coords: [number, number],
  sizeCell: [number, number],
  scaleCoords: number = 1,
  color = rgb(0, 0, 0)
): void => {
  coords = [coords[0] * scaleCoords, coords[1] * scaleCoords];
  sizeCell = [sizeCell[0] * scaleCoords, sizeCell[1] * scaleCoords];

  const size = getMaxFontSize(font, sizeCell[0], sizeCell[1], text);
  const x = (sizeCell[0] - font.widthOfTextAtSize(text, size)) / 2 + coords[0];
  page.drawText(text, { x, y: coords[1], size, font, color });
};

function getMaxFontSize(
  font: PDFFont,
  maxWidth: number,
  maxHeight: number,
  text: string
): number {
  let size = 1;
  while (font.widthOfTextAtSize(text, size) < maxWidth && size < maxHeight) {
    size += 0.1;
  }
  return size;
}
