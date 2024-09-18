import sharp from 'sharp';
import { loadImage, CanvasRenderingContext2D } from 'canvas';


export const drawText = (
    ctx: CanvasRenderingContext2D, 
    text: string, 
    x: number, 
    y: number, 
    fontOption: string = "",
    fontSize: number = 54, 
    textAlign: CanvasTextAlign = "center", 
    fontFamily: string = "Open Sans"
) => {
    ctx.font = `${fontOption} ${fontSize}px "${fontFamily}"`;
    ctx.fillStyle = 'white';
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
}

export const drawText_left = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, fontOption: string = "",fontSize: number = 54, fontFamily: string = "Open Sans") => {
    drawText(ctx, text, x, y, fontOption, fontSize, "left", fontFamily)
}

export const drawText_right = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, fontOption: string = "",fontSize: number = 54, fontFamily: string = "Open Sans") => {
    drawText(ctx, text, x, y, fontOption, fontSize, "right", fontFamily)
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

export const drawMultilineCentredText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, fontSize: number = 54, proportionLineHeight: number = 1.2, centredVertical: boolean = true, fontOption: string = "", fontFamily: string = "Open Sans") => {
    const lines = text.split('\n');
    const lineHeight = fontSize * proportionLineHeight;
    if(centredVertical) {
        y -= (lines.length * fontSize / 2) 
    }

    lines.forEach((line, index) => {
        const lineY = y + index * lineHeight;
        drawText(ctx, line, x, lineY, fontOption, fontSize, "center", fontFamily)
    });
}