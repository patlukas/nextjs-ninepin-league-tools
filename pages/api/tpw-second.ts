import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';
import {drawText, addCentredHorizontalImage, drawText_left, drawText_right, drawMultilineCentredText, drawTextWithMaxX} from '@/utils/canvaMethods'
import tpw_createBackground from '@/utils/tpwMethods';

type Player = {
    name: string[];
    pd: string;
    results: Lane[];
};

type Lane = {
    p: string;
    z: string;
    x: string;
    s: string;
    ps: string;
};

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
        players
    }: {
        list_value: string[],
        title: string,
        date: string,
        round: string,
        list_name: string[],
        players: Player[][]
    } = req.body;

    const list_x = [0, 600]
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


        for(let i=0; i<2; i++) {
            drawTeamResult(ctx, list_x[i], list_name[i], players[i])
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
    name: string,
    players: Player[]
) => {
    drawMultilineCentredText(ctx, name, x+300, 210, 50, 1.05, false, "bold")
    const y = 330
    const aY = players.length == 6 ? 150 : 250
    for(let i=0; i<players.length; i++) {
        for(let j=0; j<3; j++) {
            drawTextWithMaxX(ctx, players[i].name[j], x+5, y+30*j+aY*i, 250, "", 28, "left")
        }
        for(let j=0; j<4; j++) {
            drawSpecialText(ctx, 105, 115, 120, players[i].results[j].p, x+300, y+23*j+aY*i, "", 23)
            drawSpecialText(ctx, 70, 80, 90, players[i].results[j].z, x+375, y+23*j+aY*i, "", 23)
            drawGrayTextIf0(ctx, players[i].results[j].x, x+425, y+23*j+aY*i, "", 23)
            drawSpecialText(ctx, 160, 175, 190, players[i].results[j].s, x+475, y+23*j+aY*i, "", 23)
            drawGrayTextIf0(ctx, players[i].results[j].ps, x+525, y+23*j+aY*i, "", 23)

        }
        drawSpecialText(ctx, 400, 420, 440, players[i].results[4].p, x+300, y+23*4+aY*i, "bold", 24)
        drawSpecialText(ctx, 220, 250, 280,players[i].results[4].z, x+375, y+23*4+aY*i, "bold", 24)
        drawText(ctx, players[i].results[4].x, x+425, y+23*4+aY*i, "bold", 24)
        drawSpecialText(ctx, 600, 650, 700, players[i].results[4].s, x+475, y+23*4+aY*i, "bold", 24)
        drawText(ctx, players[i].results[4].ps, x+525, y+23*4+aY*i, "bold", 24)
        drawGrayTextIf0WithMaxX(ctx, players[i].pd, x+567, y + 45+aY*i, "bold", 65, 50)
    }
}

const drawGrayTextIf0 = (
    ctx: CanvasRenderingContext2D, 
    text: string,
    x: number,
    y: number,
    option: string, 
    fontSize: number,
) => {
    const fillStyle = text == "0" ? "#666" : "#fff"
    drawText(ctx, text, x, y, option, fontSize, "center", fillStyle)
}

const drawGrayTextIf0WithMaxX = (
    ctx: CanvasRenderingContext2D, 
    text: string,
    x: number,
    y: number,
    option: string, 
    fontSize: number,
    maxX: number
) => {
    const fillStyle = text == "0" ? "#666" : "#fff"
    drawTextWithMaxX(ctx, text, x, y, maxX, option, fontSize, "center", fillStyle)
}

const drawSpecialText = (
    ctx: CanvasRenderingContext2D, 
    threshold1: number,
    threshold2: number,
    threshold3: number,
    text: string,
    x: number,
    y: number,
    option: string, 
    fontSize: number
) => {
    const value = parseFloat(text)
    const fillStyle = value < threshold1 ? "#fff" : value < threshold2 ? "#ff0" : value < threshold3 ? "#0ff" : "#f0f"
    drawText(ctx, text, x, y, option, fontSize, "center", fillStyle)
}

