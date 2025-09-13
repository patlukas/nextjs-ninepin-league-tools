import { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
const fs = require('fs');
import path from 'path';


type Statement = {
    name: string,
    birthday: string,
    team: string,
    date: string,
    place: string
};

type PrintLayoutConfig = { 
    size: number[]; 
    single_size: number[], 
    statement_in_row: number; 
    finalSize: number[], 
    move: number[], 
    start: number[] 
}

class TooManyElementsError extends Error {
  constructor(public maxAllowed: number, public received: number) {
    super("Too many elements in array");
    this.name = "TooManyElementsError";
  }
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const {list_statement}: {list_statement: Statement[]} = req.body;

    let details;
    try {
        details = getPrintLayoutConfig(list_statement.length)
    } catch (err) {
        if (err instanceof TooManyElementsError) {
        return res.status(400).json({
            error: err.message,
            maxAllowed: err.maxAllowed,
            received: err.received,
            });
        }
        throw err;
    }


    const {size, single_size, statement_in_row, finalSize, move, start} = details;

    const finalDoc = await PDFDocument.create();
    const page = finalDoc.addPage([size[0], size[1]]);

    const templateBytes = fs.readFileSync(path.join(process.cwd(), 'public', 'other', `pool.pdf`));
    const templateDoc = await PDFDocument.load(templateBytes);

    const tempDoc = await PDFDocument.create();

    const font = await tempDoc.embedFont(StandardFonts.Helvetica);

    for (const statement of list_statement) {
        const { name, birthday, team, date, place } = statement;

        const [tempPage] = await tempDoc.copyPages(templateDoc, [0]);
        tempPage.drawText(name, {x: 127, y: tempPage.getSize().height - 133, size: 15, font, color: rgb(0, 0, 0),});
        tempPage.drawText(birthday, {x: 85, y: tempPage.getSize().height - 157, size: 15, font, color: rgb(0, 0, 0),});
        tempPage.drawText(team, {x: 127, y: tempPage.getSize().height - 181, size: 15, font, color: rgb(0, 0, 0),});
        tempPage.drawText(place + ", " + date, {x: 2, y: tempPage.getSize().height - 298, size: 15, font, color: rgb(0, 0, 0),});
        tempDoc.addPage(tempPage);
    }

    const tempPdfBytes = await tempDoc.save();
    const reloadedTempDoc = await PDFDocument.load(tempPdfBytes);

    for(let i=0; i<list_statement.length; i++) {
        let x = i % statement_in_row
        let y = (i - x) / statement_in_row
        const sourcePdfPage = reloadedTempDoc.getPages()[i]

        const embeddedModified = await finalDoc.embedPage(sourcePdfPage);

        page.drawPage(embeddedModified, {
            x:  start[0] + x * move[0],
            y: page.getSize().height - (start[1] + y * move[1]) - single_size[1],
            width: single_size[0],
            height: single_size[1],
        });
    }

    const pdfBytes = await finalDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="output.pdf"');
    res.send(Buffer.from(pdfBytes));    
}

const getPrintLayoutConfig = (number_of_statement: number): PrintLayoutConfig => {
    const maxLayoutStatementOnPage = 9
    if (number_of_statement > maxLayoutStatementOnPage) {
        throw new TooManyElementsError(maxLayoutStatementOnPage, number_of_statement);
    }
    const dict_printLayoutConfig: { [key: number]: PrintLayoutConfig } = {
        1: {
            size: [2970, 2100],
            single_size: [747, 700],
            statement_in_row: 1,
            finalSize: [594, 420],
            start: [10, 10],
            move: [747, 700]
        },
        2: {
            size: [2970, 2100],
            single_size: [747, 700],
            statement_in_row: 1,
            finalSize: [594, 420],
            start: [10, 10],
            move: [747, 700]
        },
        9: {
            size: [595, 842],
            single_size: [185, 160],
            statement_in_row: 3,
            finalSize: [1260, 1782],
            start: [10, 10],
            move: [195, 267]
        }
    }

    for(let i=number_of_statement; i<=maxLayoutStatementOnPage; i++) {
        if (i in dict_printLayoutConfig) {
            return dict_printLayoutConfig[i]
        }
    }

    throw new Error("Unexpected error")
}