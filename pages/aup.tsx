import { useEffect, useState } from "react";
import Section from "@/components/Section";
import Title from "@/components/Title";
import { DropdownList, InputButton } from "@/components/form";
import styles from "@/styles/aup.module.css";
import { getListPlayers } from "@/utils/getPlayers";
import TableSheet from "@/components/TableSheet";

type TypeOption = {
  value: string;
  label: string;
  numberOfPlayersPlaying: number;
  numberOfReservePlayers: number;
  ageCategory: string[];
  possibleLoan: boolean;
};

type DropdownOption = {
  value: string;
  label: string;
};

type PlayersByClub = { [key: string]: DropdownOption[] };

export default function Aup() {
  const [typeIndex, setTypeIndex] = useState(0);
  const [playersByClub, setPlayersByClub] = useState<PlayersByClub>({});

  useEffect(() => {
    onChangeType(0);
  }, []);

  const typeOptions: TypeOption[] = getTypeOptions();

  const onChangeType = async (index: number) => {
    setPlayersByClub(await onGetPlayersByClub({ ...typeOptions[index] }));
    setTypeIndex(index);
  };

  return (
    <div className={styles.container}>
      <Title title="Asystent Uzupełniania Protokołu" />
      <Section title="Ustawienia" className={styles.typeContainer}>
        <DropdownList
          label="Rodzaj rozgrywek"
          id="typeDropdown"
          className="typeDropdown"
          options={typeOptions}
          onChange={onChangeType}
        />
      </Section>
      <div>
        <Section title="Gospodarze" className={styles.column}>
          <AupForm
            key={typeIndex}
            playersByClub={playersByClub}
            defaultClub="KS Start Gostyń"
            className="players_home"
            cell="A15"
            {...typeOptions[typeIndex]}
          />
        </Section>
        <Section title="Goście" className={styles.column}>
          <AupForm
            key={typeIndex}
            playersByClub={playersByClub}
            className="players_guest"
            cell="P15"
            {...typeOptions[typeIndex]}
          />
        </Section>
      </div>
    </div>
  );
}

const onGetPlayersByClub = async ({
  ageCategory,
  possibleLoan,
}: {
  ageCategory: string[];
  possibleLoan: boolean;
}): Promise<PlayersByClub> => {
  const listPlayersFromApi = await getListPlayers(
    "",
    ageCategory,
    possibleLoan
  );
  let playersByClub: PlayersByClub = { "": [] };
  listPlayersFromApi.forEach((el) => {
    if (!(el.club in playersByClub)) {
      playersByClub[el.club] = [{ label: "", value: "" }];
    }
    playersByClub[el.club].push({ label: el.name, value: el.license });
  });
  return playersByClub;
};

const AupForm = ({
  numberOfPlayersPlaying,
  numberOfReservePlayers,
  playersByClub,
  defaultClub,
  className,
  cell,
}: {
  numberOfPlayersPlaying: number;
  numberOfReservePlayers: number;
  playersByClub: PlayersByClub;
  defaultClub?: string;
  className: string;
  cell: string;
}) => {
  const emptyPlayers: DropdownOption[] = [];
  for (let i = 0; i < numberOfPlayersPlaying + numberOfReservePlayers; i++) {
    emptyPlayers.push({ value: "", label: "" });
  }
  const [players, setPlayers] = useState<DropdownOption[]>(emptyPlayers);
  const [club, setClub] = useState<string>(defaultClub ?? "");
  const [numberChange, setNumberChange] = useState(0);
  if (!(club in playersByClub)) return <></>;

  let clubOptions: DropdownOption[] = [];
  Object.keys(playersByClub).forEach((key) => {
    clubOptions.push({ value: key, label: key });
  });

  const onSetClub = (index: number) => {
    const playersEl = document.querySelectorAll<HTMLSelectElement>(
      "." + className
    );
    playersEl.forEach((el) => {
      el.selectedIndex = 0;
    });
    setClub(clubOptions[index].label);
    setPlayers(emptyPlayers);
  };

  const onChangePlayer = (player: number, index: number) => {
    setPlayers((old) => {
      old[player] = playersByClub[club][index];
      return old;
    });
    setNumberChange((oldChange) => {
      return oldChange + 1;
    });
  };

  const playersEl = [];
  for (let i = 1; i <= numberOfPlayersPlaying; i++) {
    playersEl.push(
      <DropdownList
        key={"player_" + i}
        className={"selectingPlayers " + className}
        id={"player_" + i}
        label={"Zawodnik " + i + ":"}
        options={playersByClub[club]}
        onChange={(index) => onChangePlayer(i - 1, index)}
      />
    );
  }
  for (let i = 1; i <= numberOfReservePlayers; i++) {
    playersEl.push(
      <DropdownList
        key={"reserve_" + i}
        className={"selectingPlayers " + className}
        id={"reserve_" + i}
        label={"Zawodnik rezerwowy " + i + ":"}
        options={playersByClub[club]}
        onChange={(index) =>
          onChangePlayer(numberOfPlayersPlaying + i - 1, index)
        }
      />
    );
  }
  return (
    <>
      {defaultClub === undefined ? (
        <DropdownList
          label="Klub:"
          options={clubOptions}
          onChange={onSetClub}
        />
      ) : (
        <p className={styles.defaultClub}>Klub: {defaultClub}</p>
      )}
      {playersEl}
      <div className={styles.btnContainer}>
        <InputButton
          id="btn"
          label="Kopiuj"
          onClick={() => copyTable(className)}
        />
      </div>
      <TableSheet
        key={numberChange}
        players={players}
        className={className}
        numberOfPlayersPlaying={numberOfPlayersPlaying}
        numberOfReservePlayers={numberOfReservePlayers}
      />
      <Instruction cell={cell}/>
    </>
  );
};

const Instruction = ({cell}: {cell: string}) => {
  return (
    <Section title="Instrukcja" className={styles.instruction}>
      <p>1. Wypełnij formularz</p>
      <p>2. Kliknij "Kopiuj"</p>
      <p>3. Przejdź do arkusza</p>
      <p>4. Zaznacz komórkę <span className={styles.cell}>{cell}</span></p>
      <p>5. Wklej skopiowany tekst</p>
    </Section>
  )
}

const copyTable = (className: string) => {
  const tableEl = document.querySelector("table." + className);
  console.log(tableEl, "table ." + className);
  if (tableEl) {
    const range = document.createRange();
    range.selectNodeContents(tableEl);

    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand("copy");
      selection.removeAllRanges();
    }
  }
};

const getTypeOptions = (): TypeOption[] => {
  return [
    {
      value: "sm",
      label: "Superliga Mężczyzn",
      numberOfPlayersPlaying: 6,
      numberOfReservePlayers: 4,
      ageCategory: ["Junior młodszy", "Junior", "Mężczyzna"],
      possibleLoan: true,
    },
    {
      value: "clm",
      label: "CLM",
      numberOfPlayersPlaying: 4,
      numberOfReservePlayers: 3,
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
