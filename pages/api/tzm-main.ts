import { NextApiRequest, NextApiResponse } from 'next';
import { createCanvas, loadImage } from 'canvas';
import tzm_createAnnouncement from '@/utils/tzmMethods';
import sharp from 'sharp';

type CreateAnnouncement = {
    list_value: string[],
    title: string,
    datetime: string,
    list_name: string[],
    type: string,
    place: string,
    dayOfWeek: string
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {list_createAnnouncement}: {list_createAnnouncement: CreateAnnouncement[]} = req.body;
    const list_image = []
    for (const createAnnouncement of list_createAnnouncement) {
        const { list_value, title, datetime, list_name, type, place, dayOfWeek } = createAnnouncement;
    
        const image = await tzm_createAnnouncement(list_value, title, datetime, list_name, type, place, dayOfWeek);
    
        if (image !== undefined) {
            list_image.push(image);
        }
    }
    const x: { [key: number]: { size: number[]; positions: number[][]; finalSize: number[] } } = {
        1: {
            size: [1200, 630],
            positions: [
                [-34, 0]
            ],
            finalSize: [1200, 630]
        },
        2: {
            size: [1268, 1268],
            positions: [
                [0, 0],
                [0, 638]
            ],
            finalSize: [1200, 1200]
        },
        3: {
            size: [1268, 1902],
            positions: [
                [0, 0],
                [0, 636],
                [0, 1272]
            ],
            finalSize: [1200, 1800]
        },
    }

    const numberOfImage = list_image.length
    try {
        const details = x[numberOfImage]
        if (!details) {
            throw new Error(`Brak konfiguracji dla liczby obrazów: ${numberOfImage}`);
        }

        const {size, positions, finalSize} = details;

        const canvas = createCanvas(size[0], size[1]);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height); 

        for(let i=0; i<numberOfImage; i++) {
            const combinedImage = await loadImage(list_image[i]);
            ctx.drawImage(combinedImage, positions[i][0], positions[i][1]);
        }
        
        const finalImageBuffer = canvas.toBuffer('image/png');

        const resizedImageBuffer = await sharp(finalImageBuffer)
                                            .resize(finalSize[0], finalSize[1])
                                            .toBuffer();

        res.setHeader('Content-Type', 'image/png');
        res.send(resizedImageBuffer);

    } catch (error) {
        console.error('Error processing images:', error);
        res.status(500).json({ error: 'Error processing images' });
    }
}

