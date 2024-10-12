import sharp from 'sharp';
import { loadImage, CanvasRenderingContext2D, registerFont } from 'canvas';
import path from 'path';


const FONTFAMILY = "Trebuchet MS"


export const drawText = (
    ctx: CanvasRenderingContext2D, 
    text: string, 
    x: number, 
    y: number, 
    fontOption: string = "",
    fontSize: number = 54, 
    textAlign: CanvasTextAlign = "center", 
    fillStyle: string = "white",
    fontFamily: string = FONTFAMILY,
) => {
    ctx.font = `${fontOption} ${fontSize}px "${fontFamily}"`;
    ctx.fillStyle = fillStyle;
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
}

export const drawTextWithMaxX = (
    ctx: CanvasRenderingContext2D, 
    text: string, 
    x: number, 
    y: number,
    maxX: number, 
    fontOption: string = "",
    fontSize: number = 54, 
    textAlign: CanvasTextAlign = "center", 
    fillStyle: string = "white",
    fontFamily: string = FONTFAMILY,
) => {
    ctx.font = `${fontOption} ${fontSize}px "${fontFamily}"`;
    ctx.fillStyle = fillStyle;
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'middle';
    let currentFontSize = fontSize;
    do {
        ctx.font = `${fontOption} ${currentFontSize}px "${fontFamily}"`;
        var textWidth = ctx.measureText(text).width; 
        if (textWidth > maxX) {
            currentFontSize--; 
        }
    } while (textWidth > maxX && currentFontSize > 0);
    ctx.fillText(text, x, y);
}

export const drawText_left = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, fontOption: string = "",fontSize: number = 54, fillStyle: string = "white", fontFamily: string = FONTFAMILY) => {
    drawText(ctx, text, x, y, fontOption, fontSize, "left", fillStyle, fontFamily)
}

export const drawText_right = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, fontOption: string = "",fontSize: number = 54, fillStyle: string = "white", fontFamily: string = FONTFAMILY) => {
    drawText(ctx, text, x, y, fontOption, fontSize, "right", fillStyle, fontFamily)
}

export const addCentredHorizontalImage = async (
    ctx: CanvasRenderingContext2D, 
    path: string,
    height: number, 
    centredX: number, 
    y: number
) => {
    try {
        const imageBuffer = await sharp(path)
            .resize({ height })
            .toBuffer();

        const scaledImage = await loadImage(imageBuffer);
        ctx.drawImage(scaledImage, (centredX - (scaledImage.width / 2)), y);
    }
    catch {
        console.log("No exists image ", path)
    }
    
}

export const drawMultilineCentredText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, fontSize: number = 54, proportionLineHeight: number = 1.2, centredVertical: boolean = true, fontOption: string = "", fillStyle: string = "white", fontFamily: string = FONTFAMILY) => {
    const lines = text.split('\n');
    const lineHeight = fontSize * proportionLineHeight;
    if(centredVertical) {
        y -= (lines.length * fontSize / 2) 
    }

    lines.forEach((line, index) => {
        const lineY = y + index * lineHeight;
        drawText(ctx, line, x, lineY, fontOption, fontSize, "center", fillStyle, fontFamily)
    });
}