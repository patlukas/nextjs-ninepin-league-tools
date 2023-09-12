// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type License = {
  license: string;
  firstName: string;
  secondName: string;
  club: string;
  ageCategory: string;
  validLicense: string;
  loanedClub: string;
};

type LicenseReturn = {
  name: string;
  nameReverse: string;
  license: string;
  club: string;
  ageCategory: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LicenseReturn[]>
) {
  if (req.method == "POST") {
    const { club, ageCategory, validLicense, possibleLoan } = req.body;
    const allLicenses: License[] = await getAllLicenses();
    let licenses: LicenseReturn[] = [];
    allLicenses.forEach((el: License) => {
      if (!ageCategory.includes(el.ageCategory)) return;
      if (validLicense && !el.validLicense) return;
      let player: LicenseReturn = {
        name: el.firstName + " " + el.secondName,
        nameReverse: el.secondName + " " + el.firstName,
        license: el.license,
        club: el.club,
        ageCategory: el.ageCategory,
      };
      if (possibleLoan && el.loanedClub != "") player.club = el.loanedClub;
      if (club != "" && player.club != club) return;
      licenses.push(player);
    });
    res.status(200).json(licenses);
  } else {
    res.status(200).json([]);
  }
}

const getAllLicenses = async (): Promise<License[]> => {
  const urlGoogleSheetLicenses =
    "https://docs.google.com/spreadsheets/d/1VIDJbQhEMoFHlWcp8_ut3QZ8FTwccHnJ5lzx9LLyLME/gviz/tq?tqx=out:csv&gid=0";
  const listLicenses: any[] = [];
  const siteData = await fetch(urlGoogleSheetLicenses);
  const siteDataText = await siteData.text();
  var rows = siteDataText.split("\n");
  rows.shift();
  rows.forEach((row) => {
    const cells = row.replaceAll('"', "").split(",");
    cells.map((cell, index) => cells[index] = cell.trim());

    const indexLastSpace = cells[3].lastIndexOf(" ");
    const firstName =
      indexLastSpace != -1 ? cells[3].slice(indexLastSpace + 1).trim() : "";
    const secondName =
      indexLastSpace != -1 ? cells[3].slice(0, indexLastSpace).trim() : "";
    listLicenses.push({
      license: cells[0].trim(),
      firstName,
      secondName,
      club: cells[4].trim(),
      ageCategory: cells[5].trim(),
      validLicense: cells[11].trim().toUpperCase() == "TAK",
      loanedClub: cells[12].trim(),
    });
  });
  return listLicenses;
};
