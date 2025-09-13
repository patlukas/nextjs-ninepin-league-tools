import { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
const fs = require('fs');
import path from 'path';
    import fontkit from "@pdf-lib/fontkit";



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
    margin: number[], 
    space: number[] 
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


    const {size, single_size, statement_in_row, margin, space} = details;

    const finalDoc = await PDFDocument.create();
    const page = finalDoc.addPage([size[0], size[1]]);

    const templateBytes = fs.readFileSync(path.join(process.cwd(), 'public', 'other', `pool.pdf`));
    const templateDoc = await PDFDocument.load(templateBytes);

    const tempDoc = await PDFDocument.create();
    tempDoc.registerFontkit(fontkit);

    const fontPath = path.join(process.cwd(), 'public', 'fonts', `trebuc.ttf`)
    const fontBytes = fs.readFileSync(fontPath);
    const font = await tempDoc.embedFont(fontBytes);

    for (const statement of list_statement) {
        const { name, birthday, team, date, place } = statement;

        const [tempPage] = await tempDoc.copyPages(templateDoc, [0]);
        tempPage.drawText(name, {x: 135, y: tempPage.getSize().height - 133, size: 15, font, color: rgb(0, 0, 0),});
        tempPage.drawText(birthday, {x: 85, y: tempPage.getSize().height - 157, size: 15, font, color: rgb(0, 0, 0),});
        tempPage.drawText(team, {x: 127, y: tempPage.getSize().height - 181, size: 15, font, color: rgb(0, 0, 0),});
        tempPage.drawText(place + ", " + date, {x: 2, y: tempPage.getSize().height - 298, size: 12, font, color: rgb(0, 0, 0),});
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
            x:  margin[0] + x * (space[0] + single_size[0]),
            y: page.getSize().height - (margin[1] + y * (space[1] + single_size[1])) - single_size[1],
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
    const maxLayoutStatementOnPage = 20
    if (number_of_statement > maxLayoutStatementOnPage) {
        throw new TooManyElementsError(maxLayoutStatementOnPage, number_of_statement);
    }
    const dict_printLayoutConfig: { [key: number]: PrintLayoutConfig } = {
        1: {
            size: [595, 842],
            single_size: [585, 546],
            statement_in_row: 1,
            margin: [10, 10],
            space: [10, 25]
        },
        2: {
            size: [595, 842],
            single_size: [413, 386],
            statement_in_row: 1,
            margin: [90, 10],
            space: [10, 50]
        },
        4: {
            size: [595, 842],
            single_size: [282, 264],
            statement_in_row: 2,
            margin: [10, 10],
            space: [10, 50]
        },
        6: {
            size: [842, 595],
            single_size: [267, 250],
            statement_in_row: 3,
            margin: [10, 10],
            space: [10, 50]
        },
        8: {
            size: [842, 595],
            single_size: [198, 185],
            statement_in_row: 4,
            margin: [10, 10],
            space: [10, 50]
        },
        9: {
            size: [595, 842],
            single_size: [185, 173],
            statement_in_row: 3,
            margin: [10, 10],
            space: [10, 50]
        },
        12: {
            size: [595, 842],
            single_size: [180, 168],
            statement_in_row: 3,
            margin: [10, 10],
            space: [10, 50]
        },
        15: {
            size: [842, 595],
            single_size: [156, 146],
            statement_in_row: 5,
            margin: [10, 10],
            space: [10, 50]
        },
        16: {
            size: [595, 842],
            single_size: [136, 127],
            statement_in_row: 4,
            margin: [10, 10],
            space: [10, 50]
        }, 
        20: {
            size: [595, 842],
            single_size: [133, 124],
            statement_in_row: 4,
            margin: [10, 10],
            space: [10, 50]
        }
    }
    for(let i=number_of_statement; i<=maxLayoutStatementOnPage; i++) {
        if (i in dict_printLayoutConfig) {
            return dict_printLayoutConfig[i]
        }
    }

    throw new Error("Unexpected error")
}