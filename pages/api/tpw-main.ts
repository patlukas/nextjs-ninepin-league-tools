import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';
import {drawText, addCentredHorizontalImage, drawText_left, drawText_right, drawMultilineCentredText} from '@/utils/canvaMethods'
import tpw_createBackground from '@/utils/tpwMethods';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { 
        list_value, 
        title, 
        date,
        round,
        list_name, 
        type,
        list_pd,
        list_ps,
        list_sum
    }: {
        list_value: string[],
        title: string,
        date: string,
        round: string,
        list_name: string[],
        type: string,
        list_pd: string[],
        list_ps: string[],
        list_sum: string[]
    } = req.body;

    const list_x = [300, 900]

    try {
        const image: Buffer | undefined = await tpw_createBackground(list_value, title, date, round)
        if(image === undefined) {
            console.error('Error');
            res.status(500).json({ error: 'Error processing images' });
            return
        }

        const canvas = createCanvas(1200, 1200);
        const ctx = canvas.getContext('2d');

        const combinedImage = await loadImage(image);
        ctx.drawImage(combinedImage, 0, 0);

        await drawConstObject(ctx, title, round, date, type)

        for(let i=0; i<2; i++) {
            await drawTeamResult(ctx, list_x[i], list_value[i], list_name[i], list_pd[i], list_ps[i], list_sum[i])
        }

        const finalImageBuffer = canvas.toBuffer('image/png');

        res.setHeader('Content-Type', 'image/png');
        res.send(finalImageBuffer);
    } catch (error) {
        console.error('Error processing images:', error);
        res.status(500).json({ error: 'Error processing images' });
    }
}

const drawTeamResult = async (
    ctx: CanvasRenderingContext2D, 
    x: number,
    value: string,
    name: string,
    pd: string,
    ps: string,
    sum: string
) => {
    const crestPath = path.join(process.cwd(), 'public', 'crest', `${value}.png`);

    await addCentredHorizontalImage(ctx, crestPath, 415, x, 185)

    drawMultilineCentredText(ctx, name, x, 640, 56, 1.05, false, "bold")
    drawMultilineCentredText(ctx, pd, x, 895, 100, 0.8, true, "bold")
    drawMultilineCentredText(ctx, ps, x, 1035, 90, 0.8)
    drawMultilineCentredText(ctx, sum, x, 1175, 90, 0.8)
}

const drawConstObject = async (
    ctx: CanvasRenderingContext2D, 
    title: string,
    round: string,
    date: string,
    type: string,
) => {
    const vsPath = path.join(process.cwd(), 'public', 'vs', `${type}.png`);

    drawText(ctx, title, 600, 60, "bold", 95)
    drawText(ctx, "|", 600, 150)
    drawText_right(ctx, round, 575, 150)
    drawText_left(ctx, date, 625, 150)

    await addCentredHorizontalImage(ctx, vsPath, 250, 600, 270)

    drawMultilineCentredText(ctx, "Punkty\nDrużynowe", 600, 875, 54, 0.85)
    drawMultilineCentredText(ctx, "Punkty\nSetowe", 600, 1020, 54, 0.85)
    drawMultilineCentredText(ctx, "Suma", 600, 1155, 54, 0.85)
}

