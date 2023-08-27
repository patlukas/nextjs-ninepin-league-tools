type LicenseReturn = {
  name: string;
  license: string;
  club: string;
  ageCategory: string;
}

export const getListPlayers = async (
  club: string,
  ageCategory: string[],
  possibleLoan: boolean,
  validLicense: boolean = true
): Promise<LicenseReturn[]> => {
  const result = await fetch("/api/get-licenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      club,
      ageCategory,
      validLicense,
      possibleLoan,
    }),
  });
  const listPlayers: LicenseReturn[] = await result.json();
  return listPlayers;
};
