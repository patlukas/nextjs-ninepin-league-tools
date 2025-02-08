import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';
import {drawText, addCentredHorizontalImage, drawMultilineCentredText} from '@/utils/canvaMethods'

type CreateAnnouncement = {
    list_value: string[],
    title: string,
    title_abbreviation: string;
    date: string,
    time: string,
    list_name: string[],
    type: string,
    dayOfWeek: string
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { announcementSettings}: {announcementSettings: CreateAnnouncement} = req.body;

    const {list_value, title, title_abbreviation, date, time, list_name, type, dayOfWeek} = announcementSettings

    const datetime = date + " " + time
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
        const finalImageBase64 = finalImageBuffer.toString('base64');


        res.setHeader('Content-Type', 'application/json');
        res.send({
            image: `data:image/png;base64,${finalImageBase64}`,
            title: getTitle(title_abbreviation, list_name[0], list_name[1], date),
            hashtags: getHashtags(title, title_abbreviation, list_name[0], list_name[1])
        });
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

const getTitle = (
    title_abbreviation: string, 
    name_0: string, 
    name_1: string, 
    date: string
) => {
    name_0 = name_0.replaceAll("\n", " ")
    name_1 = name_1.replaceAll("\n", " ")
    return `${title_abbreviation} | ${name_0} vs ${name_1} | ${date}`
}

const limitHashtagsLEngth = (s: string, maxDlugosc: number = 500) => {
    let wyrazenia = s.split(",");
    let wynik = [];
    let dlugosc = 0;

    for (let wyrazenie of wyrazenia) {
        if (dlugosc + wyrazenie.length + wynik.length> maxDlugosc) {
            break;
        }
        wynik.push(wyrazenie);
        dlugosc += wyrazenie.length;
    }
    console.log(dlugosc, dlugosc + wynik.length)
    return wynik.join(",");
}

const getHashtags = (
    title: string,
    title_abbreviation: string, 
    name_0: string, 
    name_1: string
) => {
    name_0 = name_0.replaceAll("\n", " ")
    name_1 = name_1.replaceAll("\n", " ")
    let group_0 = `${title},${title_abbreviation},${name_0},${name_1}`
    let group_1 = group_0.replaceAll(" ", ",")
    let group_2 = `${name_0.substring(name_0.indexOf(" ")+1)},${name_1.substring(name_1.indexOf(" ")+1)}`
    let group_012 = `${group_0},${group_1},${group_2}`
    let group_3 = group_012.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    let group_0123 = `${group_012},${group_3}`.split(",")
    let unique_hashtags_list = group_0123.filter((value, index, array) => array.indexOf(value) === index);
    let unique_hashtags_string = unique_hashtags_list.join(", ")
    let hashtags = `Kręgle klasyczne, Nine-pin bowling, Ninepin Bowling Classic, 
    Kegeln,Кегельбан, Keglscheim, Keglespil, Kegloludo, Teke, Kuželky, 
    KręgleKlasyczne, ClassicBowling, BowlingSport, NinepinBowling, KegelnSport, 
    LiveSport, KegelnLive, SportNaŻywo, 
    ${unique_hashtags_string}`
    hashtags = limitHashtagsLEngth(hashtags, 465)

    return hashtags
}