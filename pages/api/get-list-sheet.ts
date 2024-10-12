import { NextApiRequest, NextApiResponse } from 'next';

const API_KEY = process.env.API_KEY

type DropdownOption = {
    value: string;
    label: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const {url}: {url: string} = req.body;

    try {
        let return_obj: {
            title: string,
            list_sheet: DropdownOption[]
        } = {
            title: "",
            list_sheet: []
        }

        const parts = url.split("/d/");
        if (parts.length < 2) {
            res.status(200).json(return_obj);
            return
        }
        const spreadsheetId = parts[1].split("/")[0];

        const api_url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${API_KEY}`

        interface SpreadsheetData {
            properties: {
                title: string
            },
            sheets: {
                properties: {
                    title: string;   // Nazwa arkusza
                    sheetId: number; // GID arkusza
                }
            }[];
        }

        console.log(api_url)

        await fetch(api_url)
            .then(response => response.json()) 
            .then((data: SpreadsheetData) => {
                return_obj.title = data.properties.title
                const sheets = data.sheets;
                
                sheets.forEach(sheet => {
                    const sheetName = sheet.properties.title;
                    const gid = sheet.properties.sheetId;
                    return_obj.list_sheet.push(
                        {
                            value: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?gid=${gid}&format=csv`,
                            label: sheetName
                        }
                    )
                });
            })
            .catch(error => console.error('Błąd:', error));

        res.status(200).json(return_obj);
    } catch (error) {
        console.error('Error processing images:', error);
        res.status(500).json({ error: 'Error processing images' });
    }
}
