import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Section from "@/components/Section";
import Title from "@/components/Title";
import { DropdownList, InputButton, InputCheckbox, InputDate, InputText } from "@/components/form";
import styles from "@/styles/aup.module.css";
import styleWaiter from "@/styles/other.module.css"
import {getListPlayers, onListPlayerFilterSM} from "@/utils/getPlayers";
import Navigate from "@/components/Navigate";
import Head from "next/head";

type PlayerInfo = {
  name: string;
  value: string;
  label: string;
  clubHome: string;
};

type TypeOption = {
  value: string;
  label: string;
  ageCategory: string[];
  possibleLoan: boolean;
  onListPlayerFilter?: (players: PlayerInfo[]) => PlayerInfo[];
};

type DropdownOption = {
  value: string;
  label: string;
};

type DropdownOptionNumber = {
  value: number;
  label: string;
};

type PlayersByClub = {
  [key: string]: PlayerInfo[];
};

export default function Pol() {
  const [typeIndex, setTypeIndex] = useState<number>(0);
  const [numberIndex, setNumberIndex] = useState<number>(0);
  const [playersByClub, setPlayersByClub] = useState<PlayersByClub>({});
  const [clubOptions, setClubOptions] = useState<DropdownOption[]>([]);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [club, setClub] = useState<string>("");
  const [wait, setWait] = useState<boolean>(false);

  const typeOptions: TypeOption[] = getTypeOptions();
  const numberOptions: DropdownOptionNumber[] = getNumberOptions();

  useEffect(() => {
    const newNumber = numberOptions[numberIndex].value
    let newPlayers = [...players]
    newPlayers.splice(newNumber)
    while(newPlayers.length < newNumber) {
      newPlayers.push({
        name: "",
        value: "",
        label: "",
        clubHome: ""
      })
    }
    setPlayers(newPlayers)
  }, [numberIndex]);

  useEffect(() => {
    const func = async () => {
      const newPlayersByClub: PlayersByClub = await onGetPlayersByClub({ ...typeOptions[typeIndex] })
      const newClubOptions: DropdownOption[] = []
      Object.keys(newPlayersByClub).forEach((key) => {
        newClubOptions.push({ value: key, label: key });
      });
      newClubOptions.sort((a, b) => {
        return a.label.localeCompare(b.label);
      });
      setPlayersByClub(newPlayersByClub);
      setClubOptions(newClubOptions)
    }

    func()
      .catch(console.error)
  }, [typeIndex])  

  const onSetClub = (index: number) => {
    const playersEl = document.querySelectorAll<HTMLSelectElement>(".players");
    playersEl.forEach((el) => {
      el.selectedIndex = 0;
    });
    setClub(clubOptions[index].label);
    let newPlayers = []
    while(newPlayers.length < numberOptions[numberIndex].value) {
      newPlayers.push({
        name: "",
        value: "",
        label: "",
        clubHome: ""
      })
    }

    setPlayers(newPlayers);
  };

  return (
    <>
      <Head>
        <title>Przygotowanie Oświadczeń Lekarskich</title>
      </Head>
      <div className={styles.container}>
        <Title title="Przygotowanie Oświadczeń Lekarskich" />
        <Navigate />
        <Section title="Ustawienia" className={styles.typeContainer}>
          <DropdownList
            label="Rodzaj rozgrywek"
            id="typeDropdown"
            className="typeDropdown"
            options={typeOptions}
            onChange={setTypeIndex}
          />
          <DropdownList
            label="Liczba oświadczeń"
            id="numberDropdown"
            className="numberDropdown"
            options={numberOptions}
            onChange={setNumberIndex}
          />
          <DropdownList
            label="Klub:"
            options={clubOptions}
            onChange={onSetClub}
          />
          <InputDate 
            id="dateInput"
            label="Data"
          />
          <InputText
            id="placeInput"
            label="Miejsce"
          />
          <InputCheckbox
            label="Obramownaia oświdczeń"
            id="borderCheckbox"
          />
        </Section>
        <div className={styles.columnContainer}>
          <Section title="Zawodnicy" className={styles.column}>
            <PlayersForm
              players={players}
              playersByClub={playersByClub}
              club={club}
              className="players"
              setPlayers={setPlayers}
            />
          </Section>
        </div>
        <div className={styles.btnContainer}>
          {wait ? (
            <div className={styleWaiter.loader}></div>
          ) : (
            <InputButton
              id="btn"
              label="Otwórz"
              onClick={() => {
                setWait(true);
                prepareDocument({
                  players,
                  endFunc: () => setWait(false),
                });
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}

const prepareDocument = async ({
  players,
  endFunc
}: {
  players: PlayerInfo[],
  endFunc: () => void
}) => {
  let date = document.querySelector<HTMLInputElement>("#dateInput")?.value ?? ""
  if (date != "") {
    const date_obj = new Date(date);

    const day = String(date_obj.getDate()).padStart(2, "0");
    const month = String(date_obj.getMonth() + 1).padStart(2, "0");
    const year = date_obj.getFullYear();

    date = `${day}.${month}.${year}`;
  }
  const place = document.querySelector<HTMLInputElement>("#placeInput")?.value ?? ""


  let body: {
    list_statement: {
      id?: string;
      name?: string,
      birthday?: string,
      team?: string,
      date?: string,
      place?: string
    }[];
    settings: {
      border: boolean
    }
  } = {
    "list_statement": [],
    "settings": {
      "border": document.querySelector<HTMLInputElement>("#borderCheckbox")?.checked ?? false
    }
  }
  for (let i=0; i<players.length; i++) {
    body.list_statement.push({
      id: players[i].value,
      name: players[i].name,
      birthday: "",
      team: players[i].clubHome,
      date,
      place
    })
  }

  await fetch("/api/pol-pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  .then((res) => res.blob())
  .then((blob) => {
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    endFunc()
  });
}

const onGetPlayersByClub = async ({
  ageCategory,
  possibleLoan,
  onListPlayerFilter,
}: {
  ageCategory: string[];
  possibleLoan: boolean;
  onListPlayerFilter?: (players: PlayerInfo[]) => PlayerInfo[];
}): Promise<PlayersByClub> => {
  const listPlayersFromApi = await getListPlayers(
    "",
    ageCategory,
    possibleLoan
  );
  let playersByClub: PlayersByClub = {
    "": [{ label: "", value: "", name: "", clubHome: ""}],
  };
  listPlayersFromApi.forEach((el) => {
    if (!(el.club in playersByClub)) {
      playersByClub[el.club] = [{ label: "", value: "", name: "", clubHome: "" }];
    }
    const player = {
      label: el.name,
      value: el.license,
      name: el.name,
      clubHome: el.clubHome
    };
    playersByClub[el.club].push(player);
    playersByClub[""].push(player);
  });
  Object.keys(playersByClub).forEach((club) => {
    playersByClub[club].sort((a, b) => {
      return a.label.localeCompare(b.label);
    });
  });
  if (onListPlayerFilter) {
    playersByClub["KS Start Gostyń"] = onListPlayerFilter(
      playersByClub["KS Start Gostyń"]
    ) as PlayerInfo[]; 
  }
  
  return playersByClub;
};

const PlayersForm = ({
  players,
  playersByClub,
  club,
  className,
  setPlayers
}: {
  players: PlayerInfo[];
  playersByClub: PlayersByClub;
  club: string;
  className: string;
  setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>
}) => {
  
  if (!(club in playersByClub)) return <></>;

  const onChangePlayer = (player: number, index: number, className: string) => {
    onCheckDuplicatePlayer(className);
    setPlayers((old) => {
      const newPlayers = [...old];
      newPlayers[player] = playersByClub[club][index]; 
      return newPlayers;
    });
  };

  const playersEl = [];
  for (let i = 1; i <= players.length; i++) {
    playersEl.push(
      <DropdownList
        key={"player_" + i}
        className={"selectingPlayers " + className}
        id={"player_" + i}
        label={"Zawodnik " + i + ":"}
        options={playersByClub[club]}
        onChange={(index) => onChangePlayer(i - 1, index, className)}
      />
    );
  }
  return (
    <>
      {playersEl}
    </>
  );
};

const getNumberOptions = (): DropdownOptionNumber[] => {
  const options: DropdownOptionNumber[] = []
  for (let i=1; i<=20; i++) {
    options.push({
      "value": i,
      "label": i.toString()
    })
  }
  return options
}

const getTypeOptions = (): TypeOption[] => {
  return [
    {
      value: "sm",
      label: "Superliga Mężczyzn",
      ageCategory: ["Junior młodszy", "Junior", "Mężczyzna"],
      possibleLoan: true,
      onListPlayerFilter: onListPlayerFilterSM
    },
    {
      value: "sk",
      label: "Superliga Kobiet",
      ageCategory: ["Juniorka młodsza", "Juniorka", "Kobieta"],
      possibleLoan: true
    },
    {
      value: "zs",
      label: "Zawody Seniorskie",
      ageCategory: ["Junior", "Mężczyzna", "Juniorka", "Kobieta"],
      possibleLoan: true
    },
    {
      value: "2liga",
      label: "2 Liga",
      ageCategory: ["Juniorka młodsza", "Juniorka", "Kobieta", "Junior młodszy", "Junior", "Mężczyzna"],
      possibleLoan: false,
    },
    {
      value: "clm",
      label: "CLM",
      ageCategory: [
        "Młodziczka",
        "Młodzik",
        "Juniorka młodsza",
        "Junior młodszy",
        "Juniorka",
        "Junior",
      ],
      possibleLoan: false,
    },
  ];
};

const onCheckDuplicatePlayer = (className: string) => {
  const listSelectPlayers = document.querySelectorAll<HTMLSelectElement>("." + className);
  let selectedPlayers: { [key: number]: number[] } = {};
  listSelectPlayers.forEach((el: HTMLSelectElement, index: number) => {
    el.classList.remove(styles.duplicatePlayer);
    const selected = el.selectedIndex;
    if (selected == 0) return;
    if (selected in selectedPlayers) {
      if (selectedPlayers[selected].length == 1) {
        listSelectPlayers[selectedPlayers[selected][0]].classList.add(
          styles.duplicatePlayer
        );
      }
      listSelectPlayers[index].classList.add(styles.duplicatePlayer);
    } else {
      selectedPlayers[selected] = [];
    }
    selectedPlayers[selected].push(index);
  });
};
