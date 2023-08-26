export const getListPlayers = async (
  club: string,
  ageCategory: string[],
  possibleLoan: boolean,
  validLicense: boolean = true
): Promise<{ value: string; label: string }[]> => {
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
  const data: any[] = await result.json();
  let listPlayers: any[] = [{ value: "", label: "" }];
  data.forEach((el) => {
    listPlayers.push({
      value: el.license,
      label: el.firstName + " " + el.secondName,
    });
  });
  return listPlayers;
};
