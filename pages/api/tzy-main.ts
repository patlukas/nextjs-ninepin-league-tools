import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';
import {drawText, addCentredHorizontalImage, drawMultilineCentredText} from '@/utils/canvaMethods'

type CreateAnnouncement = {
    list_value: string[],
    title: string,
    datetime: string,
    list_name: string[],
    type: string,
    dayOfWeek: string
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { announcementSettings}: {announcementSettings: CreateAnnouncement} = req.body;

    const {list_value, title, datetime, list_name, type, dayOfWeek} = announcementSettings

    const list_x = [480, 1440]
    try {
        const canvas = createCanvas(1920, 1080);
        const ctx = canvas.getContext('2d');

        const backgroundPath = path.join(process.cwd(), 'public', 'place', `yt_background2.png`);
        const combinedImage = await loadImage(backgroundPath);
        ctx.drawImage(combinedImage, 0, 0);

        await drawConstObject(ctx, title, datetime, dayOfWeek, type)

        for(let i=0; i<2; i++) {
            await drawTeamResult(ctx, list_x[i], list_value[i], list_name[i])
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
    name: string
) => {
    const crestPath = path.join(process.cwd(), 'public', 'crest', `${value}.png`);

    await addCentredHorizontalImage(ctx, crestPath, 600, x, 165)

    drawMultilineCentredText(ctx, name, x, 810, 80, 1.05, false, "bold")
}

const drawConstObject = async (
    ctx: CanvasRenderingContext2D, 
    title: string,
    datetime: string,
    dayOfWeek: string,
    type: string,
) => {
    const vsPath = path.join(process.cwd(), 'public', 'vs', `${type}.png`);

    drawText(ctx, title, 960, 75, "bold", 130)
    drawText(ctx, `${dayOfWeek}, ${datetime}`, 960, 1040, "", 70)

    await addCentredHorizontalImage(ctx, vsPath, 500, 960, 240)
}