import { useEffect, useState } from "react";
import Section from "@/components/Section";
import Title from "@/components/Title";
import { DropdownList, InputButton } from "@/components/form";
import styles from "@/styles/aup.module.css";
import { getListPlayers, onListPlayerFilterSM } from "@/utils/getPlayers";
import TableSheet from "@/components/TableSheet";
import Navigate from "@/components/Navigate";
import Alert from "@/src/Alert";
import Head from "next/head";

type PlayerInfo = {
  name: string;
  value: string;
  label: string;
};

type TypeOption = {
  value: string;
  label: string;
  numberOfPlayersPlaying: number;
  numberOfReservePlayers: number;
  ageCategory: string[];
  possibleLoan: boolean;
  onListPlayerFilter?: (players: PlayerInfo[]) => PlayerInfo[];
};

type DropdownOption = {
  value: string;
  label: string;
};

type PlayersByClub = {
  [key: string]: PlayerInfo[];
};

export default function Uep() {
  const [typeIndex, setTypeIndex] = useState(0);
  const [playersByClub, setPlayersByClub] = useState<PlayersByClub>({});
  const [showCopyAlert, setShowCopyAlert] = useState<boolean>(false);

  useEffect(() => {
    onChangeType(0);
  }, []);

  const typeOptions: TypeOption[] = getTypeOptions();

  const onChangeType = async (index: number) => {
    setPlayersByClub(await onGetPlayersByClub({ ...typeOptions[index] }));
    setTypeIndex(index);
  };

  const afterCopy = async () => {
    if (showCopyAlert) {
      setShowCopyAlert(false);
      await new Promise((r) => setTimeout(r, 150));
    }
    setShowCopyAlert(true);
    setTimeout(() => setShowCopyAlert(false), 4000);
  };

  return (
    <>
      <Head>
        <title>Uzupełnainie Elektronicznego Protokołu</title>
      </Head>
      <div className={styles.container}>
        <Title title="Uzupełnianie Elektronicznego Protokołu" />
        <Navigate />
        <Section title="Ustawienia" className={styles.typeContainer}>
          <DropdownList
            label="Rodzaj rozgrywek"
            id="typeDropdown"
            className="typeDropdown"
            options={typeOptions}
            onChange={onChangeType}
          />
        </Section>
        <div className={styles.columnContainer}>
          <Section title="Gospodarze" className={styles.column}>
            <UepForm
              key={typeIndex}
              playersByClub={playersByClub}
              defaultClub="KS Start Gostyń"
              className="players_home"
              cell="A15"
              afterCopy={afterCopy}
              {...typeOptions[typeIndex]}
            />
          </Section>
          <Section title="Goście" className={styles.column}>
            <UepForm
              key={typeIndex}
              playersByClub={playersByClub}
              className="players_guest"
              cell="P15"
              afterCopy={afterCopy}
              {...typeOptions[typeIndex]}
            />
          </Section>
        </div>
        <Alert
          text="Skopiowano"
          show={showCopyAlert}
          onClick={() => setShowCopyAlert(false)}
        />
      </div>
    </>
  );
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
    "": [{ label: "", value: "", name: "" }],
  };
  listPlayersFromApi.forEach((el) => {
    if (!(el.club in playersByClub)) {
      playersByClub[el.club] = [{ label: "", value: "", name: "" }];
    }
    const player = {
      label: el.name,
      value: el.license,
      name: el.name,
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
    );
  }
  console.log(playersByClub);
  return playersByClub;
};

const UepForm = ({
  numberOfPlayersPlaying,
  numberOfReservePlayers,
  playersByClub,
  defaultClub,
  className,
  cell,
  afterCopy,
}: {
  numberOfPlayersPlaying: number;
  numberOfReservePlayers: number;
  playersByClub: PlayersByClub;
  defaultClub?: string;
  className: string;
  cell: string;
  afterCopy: () => void;
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
  clubOptions.sort((a, b) => {
    return a.label.localeCompare(b.label);
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

  const onChangePlayer = (player: number, index: number, className: string) => {
    onCheckDuplicatePlayer(className);
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
        onChange={(index) => onChangePlayer(i - 1, index, className)}
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
          onChangePlayer(numberOfPlayersPlaying + i - 1, index, className)
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
          onClick={() => {
            copyTable(className);
            afterCopy();
          }}
        />
      </div>
      <TableSheet
        key={numberChange}
        players={players}
        className={className}
        numberOfPlayersPlaying={numberOfPlayersPlaying}
        numberOfReservePlayers={numberOfReservePlayers}
      />
      <Instruction cell={cell} />
    </>
  );
};

const Instruction = ({ cell }: { cell: string }) => {
  return (
    <Section title="Instrukcja" className={styles.instruction}>
      <p>1. Wypełnij formularz</p>
      <p>2. Kliknij "Kopiuj"</p>
      <p>3. Przejdź do arkusza</p>
      <p>
        4. Zaznacz komórkę <span className={styles.cell}>{cell}</span>
      </p>
      <p>5. Wklej skopiowany tekst</p>
    </Section>
  );
};

const copyTable = (className: string) => {
  const tableEl = document.querySelector("table." + className);
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
      onListPlayerFilter: onListPlayerFilterSM,
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

const onCheckDuplicatePlayer = (className: string) => {
  const listSelectPlayers = document.querySelectorAll<HTMLSelectElement>(
    "." + className
  );
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
