import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';
import {drawText, drawText_left, drawText_right} from '@/utils/canvaMethods'

export default async function tpw_createBackground(list_value: string[], title: string, date: string, round: string) {
    const list_x = [300, 900]

    try {
        let list_img_background: Buffer[] = []
        list_value.forEach(value => {
            const aImagePath = path.join(process.cwd(), 'public', 'tpw_background', `${value}.png`);
            const imageA = fs.readFileSync(aImagePath);
            list_img_background.push(imageA)
        });

        const combinedImageBuffer  = await sharp({
            create: {
                width: 1200,
                height: 1200,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            },
        })
        .composite([
            { input: list_img_background[0], left: 0, top: 0 },
            { input: list_img_background[1], left: 600, top: 0 }
        ])
        .png()
        .toBuffer();

        const canvas = createCanvas(1200, 1200);
        const ctx = canvas.getContext('2d');

        const combinedImage = await loadImage(combinedImageBuffer);
        ctx.drawImage(combinedImage, 0, 0);

        await drawConstObject(ctx, title, round, date)

        const finalImageBuffer = canvas.toBuffer('image/png');
        return finalImageBuffer
    } catch (error) {
        return undefined
    }
}

const drawConstObject = async (
    ctx: CanvasRenderingContext2D, 
    title: string,
    round: string,
    date: string
) => {
    drawText(ctx, title, 600, 60, "bold", 90)
    drawText(ctx, "|", 600, 140, "", 50)
    drawText_right(ctx, round, 575, 140, "", 50)
    drawText_left(ctx, date, 625, 140, "", 50)
}

