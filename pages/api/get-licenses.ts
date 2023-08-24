// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type License = {
  value: string;
  label: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<License[]>
) {
  if (req.method == "POST") {
    const { club, ageCategory, validLicense} = req.body;
    const allLicenses = await getAllLicenses();
    let licenses: any[] = [];
    allLicenses.forEach((el) => {
      if (!ageCategory.includes(el.ageCategory)) return;
      if (club != el.club) return;
      if (validLicense && !el.validLicense) return;
      licenses.push(el);
    });
    res.status(200).json(licenses);
  } else {
    res.status(200).json([]);
  }
}

const getAllLicenses = async (): Promise<any[]> => {
  const urlGoogleSheetLicenses =
    "https://docs.google.com/spreadsheets/d/1VIDJbQhEMoFHlWcp8_ut3QZ8FTwccHnJ5lzx9LLyLME/gviz/tq?tqx=out:csv&gid=0";
  const listLicenses: any[] = [];
  const siteData = await fetch(urlGoogleSheetLicenses);
  const siteDataText = await siteData.text();
  var rows = siteDataText.split("\n");
  rows.shift();
  rows.forEach((row) => {
    const cells = row.replaceAll('"', "").split(",");
    cells.map((cell) => cell.trim());

    const indexLastSpace = cells[3].lastIndexOf(" ");
    const firstName =
      indexLastSpace != -1 ? cells[3].slice(0, indexLastSpace) : "";
    const secondName =
      indexLastSpace != -1 ? cells[3].slice(indexLastSpace + 1) : "";
    listLicenses.push({
      license: cells[0],
      firstName,
      secondName,
      club: cells[4],
      ageCategory: cells[5],
      validLicense: cells[11] == "TAK",
      loanedClub: cells[12],
    });
  });
  return listLicenses;
};
