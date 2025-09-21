type LicenseReturn = {
  name: string;
  nameReverse: string;
  license: string;
  club: string;
  clubHome: string;
  ageCategory: string;
}

export type GP_Filter = {
  name: string;
  [key: string]: string;
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

export const onListPlayerFilterSM = (players: GP_Filter[]): GP_Filter[] => {
  const expectedPlayers = [
    "Dominik Dutkiewicz",
    "Włodzimierz Dutkiewicz",
    "Michał Bonk",
    "Mikołaj Hajnsz",
    "Patryk Lukaszewski",
    "Jędrzej Michalak",
    "Jakub Osiewicz",
    "Mateusz Ptak",
    "Karol Sellmann",
    "Andrzej Zagata",
    "Bogusław Zagata",
    "Krzysztof Zagata",
    "Szymon Banaszak",
    "Jakub Klimański"
  ]
  let playersResult: GP_Filter[] = [];
  if(players === undefined) return[];
  players.forEach(player => {
    if(player.name == "" || expectedPlayers.includes(player.name)) {
      playersResult.push(player)
    }
  });
  return playersResult;
}
