import {
  DropdownList,
  InputText,
  InputDate,
  InputCheckbox,
  InputButton,
} from "@/components/form";
import { useState, useEffect } from "react";
import { PDFDocument} from "pdf-lib";
import { setFont, drawTextCenter } from "@/utils/pdfDoc";
import fs from "fs";
import path from "path";
import styles from '@/styles/index.module.css' 

const SCALE = 842 / 1169;

type FormData = {
  name: string;
  font: string;
  club: string;
  date: string;
  players: { name: string; license: string }[];
  secondRegistration: boolean;
};

type DropdownOption = {
  value: string;
  label: string;
};

type TypeOption = {
  value: string;
  label: string;
  name: string;
  numberOfPlayersPlaying: number;
  numberOfReservePlayers: number;
  ageCategory: string[];
};

export default function Home({ fonts }: { fonts: string[] }) {
  const [typeIndex, setTypeIndex] = useState(0);
  const [listPlayers, setListPlayers] = useState<DropdownOption[]>([]);
  useEffect(() => {
    onLoadListPlayers();
  }, []);

  const typeOptions: TypeOption[] = getTypeOptions();
  const fontOptions: DropdownOption[] = getFontOptions(fonts);

  const onLoadListPlayers = async (index?: number) => {
    if (index === undefined) index = typeIndex;
    const { ageCategory } = typeOptions[index];
    const listPlayers = await getListPlayers(ageCategory);
    setListPlayers(listPlayers);
  };

  const onChangeTypeIndex = async (index: number) => {
    const listSelectPlayers =
      document.querySelectorAll<HTMLSelectElement>(".selectingPlayers");
    listSelectPlayers.forEach((el) => (el.selectedIndex = 0));
    setTypeIndex(index);
    onLoadListPlayers(index);
  };

  return (
    <div className={styles.container}>
      <DropdownList id="fontDropdown" label="Czcionka:" options={fontOptions} />
      <DropdownList
        id="typeDropdown"
        label="Rodzaj rozgrywek:"
        options={typeOptions}
        onChange={onChangeTypeIndex}
      />
      <InputText
        id="nameInput"
        label="Nazwa meczu:"
        defaultValue={typeOptions[typeIndex].name}
      />
      <InputText id="clubInput" label="Klub:" defaultValue="KS Start Gostyń" />
      <InputDate id="dateInput" label="Data:" />
      <PlayersList listPlayers={listPlayers} {...typeOptions[typeIndex]} />
      <InputCheckbox
        id="secondRegistration"
        label="Drugi egzemplarz 'Zgłoszenie drużyny do meczu'"
      />
      <div className={styles.containerBtn}>
        <InputButton id="btn1" label="Drukuj" onClick={onPrint} />
        <InputButton id="btn2" label="Zapisz" onClick={onDownload} />
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const fontFolderPath = path.join(process.cwd(), "public", "font");

  try {
    const fontFileNames = await fs.promises.readdir(fontFolderPath);
    const fontNames = fontFileNames.filter((fileName) =>
      fileName.endsWith(".ttf")
    );

    return {
      props: {
        fonts: fontNames,
      },
    };
  } catch (error) {
    console.error("Błąd podczas odczytu nazw plików fontów:", error);
    return {
      props: {
        fonts: [],
      },
    };
  }
}

const getFontOptions = (fonts: string[]): DropdownOption[] => {
  let fontOptions: DropdownOption[] = [];
  fonts.forEach((el) => {
    fontOptions.push({ value: el, label: el.split(".")[0] });
  });
  return fontOptions;
};

const getTypeOptions = (): TypeOption[] => {
  return [
    {
      value: "sm",
      label: "Superliga Mężczyzn",
      name: "Mecz SM nr",
      numberOfPlayersPlaying: 6,
      numberOfReservePlayers: 4,
      ageCategory: ["Junior młodszy", "Junior", "Mężczyzna"],
    },
    {
      value: "clm",
      label: "CLM",
      name: "Mecz CLM nr",
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
    },
  ];
};

const getListPlayers = async (
  ageCategory: string[]
): Promise<DropdownOption[]> => {
  const result = await fetch("/api/get-licenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      club: "KS Start Gostyń",
      ageCategory,
      validLicense: false,
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

const PlayersList = ({
  listPlayers,
  numberOfPlayersPlaying,
  numberOfReservePlayers,
}: {
  listPlayers: { value: string; label: string }[];
  numberOfPlayersPlaying: number;
  numberOfReservePlayers: number;
}) => {
  const elPlayers = [];
  for (let i = 1; i <= numberOfPlayersPlaying; i++) {
    elPlayers.push(
      <DropdownList
        key={"player_" + i}
        className="selectingPlayers"
        id={"player_" + i}
        label={"Zawodnik " + i + ":"}
        options={listPlayers}
      />
    );
  }
  for (let i = 1; i <= numberOfReservePlayers; i++) {
    elPlayers.push(
      <DropdownList
        key={"reserve_" + i}
        className="selectingPlayers"
        id={"reserve_" + i}
        label={"Zawodnik rezerwowy " + i + ":"}
        options={listPlayers}
      />
    );
  }
  return <div>{elPlayers}</div>;
};

const onPrint = async () => {
  const blob = await onCretePdf();

  const pdfUrl = URL.createObjectURL(blob);
  const iframe = document.createElement("iframe");
  iframe.src = pdfUrl;
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  iframe.onload = () => {
    if (iframe.contentWindow) {
      iframe.contentWindow.print();

      iframe.contentWindow.addEventListener("afterprint", () => {
        URL.revokeObjectURL(pdfUrl);
        document.body.removeChild(iframe);
      });
    }
  };
};

const onDownload = async () => {
  const blob = await onCretePdf();

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "kregle_liga.pdf";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
};

const onCretePdf = async (): Promise<Blob> => {
  const formData: FormData = onReadDataFromForm();
  const existingPdfBytes = await fetch(
    `/application/application_${formData.players.length}.pdf`
  ).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  console.log(formData.font)
  const font = await setFont(pdfDoc, "/font/"+formData.font);

  if (formData.secondRegistration) {
    const firstPage = await pdfDoc.copyPages(pdfDoc, [0]);
    pdfDoc.addPage(firstPage[0]);
  }

  const page = pdfDoc.getPage(0);
  drawTextCenter(page, font, formData.name, [254, 1079], [523, 18], SCALE);
  drawTextCenter(page, font, formData.club, [254, 1049], [256, 18], SCALE);
  drawTextCenter(page, font, formData.date, [581, 1049], [196, 18], SCALE);

  formData.players.forEach((el, index) => {
    const y = 997 - 26 * index;
    drawTextCenter(page, font, el.license, [101, y], [108, 18], SCALE);
    drawTextCenter(page, font, el.name, [216, y], [561, 18], SCALE);
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  return blob;
};

const onReadDataFromForm = (): FormData => {
  let data: FormData = {
    name: document.querySelector<HTMLInputElement>("#nameInput")?.value ?? "",
    font: document.querySelector<HTMLInputElement>("#fontDropdown")?.value ?? "",
    club: document.querySelector<HTMLInputElement>("#clubInput")?.value ?? "",
    date: document.querySelector<HTMLInputElement>("#dateInput")?.value ?? "",
    players: [],
    secondRegistration:
      document.querySelector<HTMLInputElement>("#secondRegistration")
        ?.checked ?? false,
  };

  const players =
    document.querySelectorAll<HTMLSelectElement>(".selectingPlayers");
  players.forEach((el) => {
    data.players.push({
      name: el.options[el.selectedIndex].text,
      license: el.value,
    });
  });
  return data;
};
