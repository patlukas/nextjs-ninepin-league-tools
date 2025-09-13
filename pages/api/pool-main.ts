import { NextApiRequest, NextApiResponse } from 'next';
import { Canvas, createCanvas, Image, loadImage } from 'canvas';
// import tzm_createAnnouncement from '@/utils/tzmMethods';
import sharp from 'sharp';

type Statement = {
    name: string,
    birthday: string,
    team: string,
    date: string,
    place: string
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const {list_statement}: {list_statement: Statement[]} = req.body;
    const list_image = []

    const x: { [key: number]: { size: number[]; single_size: number[], statement_in_row: number; finalSize: number[], move: number[], start: number[] } } = {
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
            size: [2100, 2970],
            single_size: [660, 618],
            statement_in_row: 3,
            finalSize: [1260, 1782],
            start: [30, 30],
            move: [690, 950]
        }
    }
    
    const numberOfImage = list_image.length
    // try {
        // const canvas = createCanvas(1836, 1720);
        // const ctx = canvas.getContext('2d');
        const canvas_single = createCanvas(1836, 1720);
        const ctx_single = canvas_single.getContext('2d');
        const statementPath = path.join(process.cwd(), 'public', 'other', `pool.png`);
        let statementImage = await loadImage(statementPath);


        const details = x[9]
        if (!details) {
            throw new Error(`Brak konfiguracji dla liczby obrazów: ${numberOfImage}`);
        }

        const {size, single_size, statement_in_row, finalSize, move, start} = details;

        const canvas = createCanvas(size[0], size[1]);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let i = 0;
        for (const statement of list_statement) {
            console.log("i_start", i)
            const { name, birthday, team, date, place } = statement;
                    console.log("i_start", 0)

            let image = await pool_createStatement(canvas_single, ctx_single, statementImage, name, birthday, team, date, place);
                    console.log("1", i)

            // if (image === undefined) {
            //     continue;
            // }
            console.log("2", i)

            let x = i % statement_in_row
            let y = (i - x) / statement_in_row            
             console.log("3", i)
            // const finalImageBuffer = canvas.toBuffer('image/png');
            // let combinedImage = await loadImage(image);           
             console.log("4", i)

            ctx.drawImage(canvas_single, start[0] + x * move[0], start[1] + y * move[1], single_size[0], single_size[1]);
                        console.log("i_end", i)
            // combinedImage = null
            // image = null;

            i += 1;
        }

        const finalImageBuffer = canvas.toBuffer('image/png');

        const resizedImageBuffer = await sharp(finalImageBuffer)
                                            .resize(finalSize[0], finalSize[1])
                                            .toBuffer();

        res.setHeader('Content-Type', 'image/png');
        res.send(resizedImageBuffer);

    // } catch (error) {
    //     console.error('Error processing images:', error);
    //     res.status(500).json({ error: 'Error processing images' });
    // }

    
}


import path from 'path';
// import { CanvasRenderingContext2D } from 'canvas';
import {drawText, drawTextWithMaxX, addCentredHorizontalImage, drawMultilineCentredText} from '@/utils/canvaMethods'

async function pool_createStatement(
    canvas: Canvas,
    ctx: CanvasRenderingContext2D,
    combinedImage: Image,
    name: string,
    birthday: string,
    team: string,
    date: string,
    place: string
) {
    // const list_x = [334, 934]
    // try {
        console.log("pc_1")
        ctx.clearRect(0, 0, 1836, 1720);
        // const canvas = createCanvas(1836, 1720);
        // const ctx2 = canvas.getContext('2d');
        console.log("pc_2")

        // const backgroundPath = path.join(process.cwd(), 'public', 'other', `pool.png`);
        // let combinedImage = await loadImage(backgroundPath);
        ctx.drawImage(combinedImage, 0, 0);
        // combinedImage = null
        console.log("pc_3")

        drawText(ctx, name, 558, 535, "", 65, "left", "black")
        drawText(ctx, birthday, 342, 631, "", 65, "left", "black")
        drawText(ctx, team, 526, 731, "", 65, "left", "black")
        drawTextWithMaxX(ctx, date + ", " + place, 345, 1225, 690, "", 54, "center", "black")
        console.log("pc_4")

        // const finalImageBuffer = canvas.toBuffer('image/png');
        //         console.log("pc_5")

        // return finalImageBuffer;
    // } catch (error) {
    //     return undefined
    // }
}

// const drawTeamResult = async (
//     ctx: CanvasRenderingContext2D, 
//     x: number,
//     value: string,
//     name: string
// ) => {
//     if(value != "") {
//         const crestPath = path.join(process.cwd(), 'public', 'crest', `${value}.png`);
//         await addCentredHorizontalImage(ctx, crestPath, 345, x, 155)
//     } 
//     drawMultilineCentredText(ctx, name, x, 530, 56, 1.05, false, "bold")
// }

// const drawConstObject = async (
//     ctx: CanvasRenderingContext2D, 
//     title: string,
//     datetime: string,
//     dayOfWeek: string,
//     type: string,
// ) => {
//     drawText(ctx, title, 634, 45, "bold", 80)
//     drawText(ctx, `${dayOfWeek}, ${datetime}`, 634, 115, "", 45)

//     const vsPath = path.join(process.cwd(), 'public', 'vs', `${type}.png`);
//     await addCentredHorizontalImage(ctx, vsPath, 300, 634, 175)
// }


