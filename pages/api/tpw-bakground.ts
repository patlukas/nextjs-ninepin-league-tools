import { NextApiRequest, NextApiResponse } from 'next';
import tpw_createBackground from '@/utils/tpwMethods';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const { 
        list_value, 
        title, 
        date,
        round
    }: {
        list_value: string[],
        title: string,
        date: string,
        round: string
    } = req.body;

    const image = tpw_createBackground(list_value, title, date, round)
    if(image !== undefined) {
        res.setHeader('Content-Type', 'image/png');
        res.send(image);
    }
    else {
        console.error('Error');
        res.status(500).json({ error: 'Error processing images' });
    }
}
