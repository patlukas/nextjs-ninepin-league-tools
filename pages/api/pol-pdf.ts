import { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, PDFPage, rgb } from "pdf-lib";
const fs = require('fs');
import path from 'path';
import fontkit from "@pdf-lib/fontkit";

// ----- Types ----- \\

type ReqBody = {
    list_statement: Statement[]
    template_statement?: Statement
    settings?: Settings
}

type Statement = {
    id?: string;
    name?: string,
    birthday?: string,
    team?: string,
    date?: string,
    place?: string
};

type Settings = {
    border?: boolean
}

type PrintLayoutConfig = { 
    page: Page;
    statement: Page;
    statement_in_row: number; 
    border_bottom?: boolean
}

type Page = {
    size: [number, number],
    margin: [number, number, number, number]
}

class TooManyElementsError extends Error {
  constructor(public maxAllowed: number, public received: number) {
    super("Too many elements in array");
    this.name = "TooManyElementsError";
  }
}


// ----- Dictionary ----- \\

const dict_printLayoutConfig: { [key: number]: PrintLayoutConfig } = {
    1: {
        page: {
            size: [595, 842],
            margin: [10, 10, 10, 10]
        },
        statement: {
            size: [585, 546],
            margin: [5, 12, 5, 12]
        },
        statement_in_row: 1,
    },
    2: {
        page: {
            size: [595, 842],
            margin: [90, 10, 90, 10]
        },
        statement: {
            size: [403, 376],
            margin: [5, 10, 5, 20]
        },
        statement_in_row: 1,
    },
    4: {
        page: {
            size: [595, 842],
            margin: [10, 10, 10, 10]
        },
        statement: {
            size: [277, 259],
            margin: [5, 10, 5, 20]
        },
        statement_in_row: 2,
        border_bottom: true
    },
    6: {
        page: {
            size: [842, 595],
            margin: [10, 10, 10, 10]
        },
        statement: {
            size: [264, 247],
            margin: [5, 10, 5, 20]
        },
        statement_in_row: 3,
    },
    8: {
        page: {
            size: [842, 595],
            margin: [10, 10, 10, 10]
        },
        statement: {
            size: [195, 185],
            margin: [5, 10, 5, 20]
        },
        statement_in_row: 4,
        border_bottom: true
    },
    9: {
        page: {
            size: [595, 842],
            margin: [10, 10, 10, 10]
        },
        statement: {
            size: [182, 170],
            margin: [5, 10, 5, 20]
        },
        statement_in_row: 3,
        border_bottom: true
    },
    12: {
        page: {
            size: [595, 842],
            margin: [10, 10, 10, 10]
        },
        statement: {
            size: [180, 168],
            margin: [5, 10, 5, 20]
        },
        statement_in_row: 3,
    },
    15: {
        page: {
            size: [842, 595],
            margin: [10, 10, 10, 10]
        },
        statement: {
            size: [154, 144],
            margin: [5, 10, 5, 20]
        },
        statement_in_row: 5,
    },
    16: {
        page: {
            size: [595, 842],
            margin: [10, 10, 10, 10]
        },
        statement: {
            size: [133, 124],
            margin: [5, 10, 5, 20]
        },
        statement_in_row: 4,
    }, 
    20: {
        page: {
            size: [595, 842],
            margin: [10, 10, 10, 10]
        },
        statement: {
            size: [133, 124],
            margin: [5, 10, 5, 20]
        },
        statement_in_row: 4,
    }
}


// ----- Function ----- \\

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const {list_statement, template_statement = {}, settings = {}}: ReqBody = req.body;

    try {
        const layoutConfig: PrintLayoutConfig = getPrintLayoutConfig(list_statement.length)
        const docWithPrepareStatements: PDFDocument = await prepareStatements(list_statement, template_statement)
        const pdfBytes = await prepareFinallyDocument(docWithPrepareStatements, layoutConfig, settings)

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="output.pdf"');
        res.send(Buffer.from(pdfBytes)); 
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
}

const prepareStatements = async (
    list_statement: Statement[], 
    template_statement: Statement
): Promise<PDFDocument> => {
    const fontPath = path.join(process.cwd(), 'public', 'fonts', `trebuc.ttf`)
    const fontBytes = fs.readFileSync(fontPath);

    const templateBytes = fs.readFileSync(path.join(process.cwd(), 'public', 'other', `pool.pdf`));
    const templateDoc = await PDFDocument.load(templateBytes);

    const tempDoc = await PDFDocument.create();
    tempDoc.registerFontkit(fontkit);

    const font = await tempDoc.embedFont(fontBytes);
    const color = rgb(0, 0, 0)
    const size = 15

    for (let i = 0; i < list_statement.length; i++) {
        const {
            name = template_statement["name"] ?? "",
            birthday = template_statement["birthday"] ?? "",
            team = template_statement["team"] ?? "",
            place = template_statement["place"] ?? "",
            date = template_statement["date"] ?? "",
        } = list_statement[i]

        const [tempPage] = await tempDoc.copyPages(templateDoc, [0]);
        const h = tempPage.getSize().height

        tempPage.drawText(name, {x: 135, y: h - 133, size, font, color});
        tempPage.drawText(birthday, {x: 85, y: h - 157, size, font, color});
        tempPage.drawText(team, {x: 127, y: h - 181, size, font, color});
        tempPage.drawText(place + ", " + date, {x: 2, y: h - 298, size: 12, font, color});
        tempDoc.addPage(tempPage);
    }

    const tempPdfBytes = await tempDoc.save();
    const reloadedTempDoc = await PDFDocument.load(tempPdfBytes);
    return reloadedTempDoc
}

const prepareFinallyDocument = async (
    docWithStatements: PDFDocument, 
    layoutConfig: PrintLayoutConfig, 
    settings: Settings
): Promise<Uint8Array> => {
    const {page, statement, statement_in_row, border_bottom = false} = layoutConfig;

    const finalDoc = await PDFDocument.create();
    const finalPage = finalDoc.addPage([page.size[0], page.size[1]]);

    for(let i=0; i<docWithStatements.getPageCount(); i++) {
        let col_nr = i % statement_in_row
        let row_nr = (i - col_nr) / statement_in_row
        const sourcePdfPage = docWithStatements.getPages()[i]

        const embedStatement = await finalDoc.embedPage(sourcePdfPage);

        const x_pos = page.margin[0] + col_nr * (statement.margin[0] + statement.margin[2] + statement.size[0]) + statement.margin[0]
        const y_pos = finalPage.getSize().height - (page.margin[1] + row_nr * (statement.margin[1] + statement.margin[3] + statement.size[1])) - statement.size[1] - statement.margin[1]

        finalPage.drawPage(embedStatement, {
            x: x_pos,
            y: y_pos,
            width: statement.size[0],
            height: statement.size[1],
        });

        addBorders(
            settings?.border ?? false,
            border_bottom,
            finalPage,
            x_pos, y_pos,
            col_nr, row_nr,
            statement_in_row,
            statement,
            docWithStatements.getPageCount()
        )
    }

    const pdfBytes = await finalDoc.save();
    return pdfBytes
}

const addBorders = (
    add_border: boolean,
    add_border_bottom: boolean,
    page: PDFPage, 
    x_statement: number, 
    y_statement: number,
    col: number, 
    row: number, 
    statement_in_row: number, 
    statement: Page,
    numberStatement: number
) => {
    if(!add_border) {
        return
    }

    const x = x_statement + statement.size[0] + statement.margin[2]
    const y = y_statement - statement.margin[3]

    const border_width = statement.margin[0] + statement.size[0] + statement.margin[2]
    const border_height = statement.margin[1] + statement.size[1] + statement.margin[3]

    const color = rgb(0.8, 0.8, 0.8)

    if (col + 1 != statement_in_row) {
        page.drawLine({
            start: { x, y },
            end: { x, y: y + border_height },
            thickness: 1,
            color 
        })
    }
    if (add_border_bottom || row + 1 < numberStatement / statement_in_row) {
        page.drawLine({
            start: { x, y },
            end: { x: x - border_width, y },
            thickness: 1,
            color
        })
    }
}

const getPrintLayoutConfig = (number_of_statement: number): PrintLayoutConfig => {
    const maxLayoutStatementOnPage = Math.max(...Object.keys(dict_printLayoutConfig).map(Number))

    if (number_of_statement > maxLayoutStatementOnPage) {
        throw new TooManyElementsError(maxLayoutStatementOnPage, number_of_statement);
    }

    for(let i=number_of_statement; i<=maxLayoutStatementOnPage; i++) {
        if (i in dict_printLayoutConfig) {
            return dict_printLayoutConfig[i]
        }
    }

    throw new Error("Unexpected error")
}