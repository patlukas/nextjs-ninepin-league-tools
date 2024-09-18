import path from 'path';
import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';
import {drawText, addCentredHorizontalImage, drawMultilineCentredText} from '@/utils/canvaMethods'

export default async function tzm_createAnnouncement(
    list_value: string[], 
    title: string, 
    datetime: string,
    list_name: string[], 
    type: string,
    place: string,
    dayOfWeek: string
) {
    const list_x = [334, 934]
    try {
        const canvas = createCanvas(1268, 630);
        const ctx = canvas.getContext('2d');

        const backgroundPath = path.join(process.cwd(), 'public', 'place', `${place}.png`);
        const combinedImage = await loadImage(backgroundPath);
        ctx.drawImage(combinedImage, 0, 0);

        await drawConstObject(ctx, title, datetime, dayOfWeek, type)

        for(let i=0; i<2; i++) {
            await drawTeamResult(ctx, list_x[i], list_value[i], list_name[i])
        }

        const finalImageBuffer = canvas.toBuffer('image/png');
        return finalImageBuffer;
    } catch (error) {
        return undefined
    }
}

const drawTeamResult = async (
    ctx: CanvasRenderingContext2D, 
    x: number,
    value: string,
    name: string
) => {
    if(value != "") {
        const crestPath = path.join(process.cwd(), 'public', 'crest', `${value}.png`);
        await addCentredHorizontalImage(ctx, crestPath, 345, x, 155)
    } 
    drawMultilineCentredText(ctx, name, x, 530, 56, 1.05, false, "bold")
}

const drawConstObject = async (
    ctx: CanvasRenderingContext2D, 
    title: string,
    datetime: string,
    dayOfWeek: string,
    type: string,
) => {
    drawText(ctx, title, 634, 45, "bold", 80)
    drawText(ctx, `${dayOfWeek}, ${datetime}`, 634, 115, "", 45)

    const vsPath = path.join(process.cwd(), 'public', 'vs', `${type}.png`);
    await addCentredHorizontalImage(ctx, vsPath, 300, 634, 175)
}

