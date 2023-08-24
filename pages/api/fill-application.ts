import type { NextApiRequest, NextApiResponse } from "next";
import { PDFDocument, rgb } from "pdf-lib";


export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);
    page.drawText("Hello world!", { x: 50, y: 700, size: 24, color: rgb(0, 0, 0) });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });

    res.setHeader("Content-Disposition", "attachment; filename=file.pdf");
    res.setHeader("Content-Type", "application/pdf");
    res.send(blob);
  } catch (error) {
    console.error("Wystąpił błąd: ", error);
    res.status(500).json({ message: "Wystąpił błąd" });
  }
}
