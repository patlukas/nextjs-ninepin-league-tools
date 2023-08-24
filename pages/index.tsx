import {
  DropdownList,
  InputText,
  InputDate,
  InputCheckbox,
  InputButton,
} from "@/src/form";
import { useState, useEffect } from "react";
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

const SCALE = 842 / 1169;

type FormData = {
  name: string;
  club: string;
  date: string;
  players: { name: string; license: string }[];
  secondRegistration: boolean;
};

export default function Home() {
  const [typeIndex, setTypeIndex] = useState(0);
  const [listPlayers, setListPlayers] = useState<{value: string, label: string}[]>([]);

  const typeOptions = [
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

  useEffect(() => {
    onLoadListPlayers()
  }, []);

  const onLoadListPlayers = async (index?: number) => {
    if (index === undefined) index = typeIndex;
    const {ageCategory} = typeOptions[index]
    const result = await fetch("/api/get-licenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({club: "KS Start Gostyń", ageCategory, validLicense: false})
    })
    const data: any[] = await result.json();
    let listPlayers: any[] = [{value: "", label: ""}]
    data.forEach(el => {
      listPlayers.push({value: el.license, label: el.firstName + " " + el.secondName})
    });
    setListPlayers(listPlayers);
  }

  const onChangeTypeIndex = async (index: number) => {
    const listSelectPlayers = document.querySelectorAll<HTMLSelectElement>(".selectingPlayers")
    listSelectPlayers.forEach(el => el.selectedIndex = 0)
    setTypeIndex(index);
    onLoadListPlayers(index)
  }

  return (
    <>
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
      <InputButton id="btn1" label="Drukuj" onClick={onPrint} />
      <InputButton id="btn2" label="Zapisz" onClick={onDownload} />
    </>
  );
}

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
        className="selectingPlayers"
        id={"player_" + i}
        label={"Graz " + i}
        options={listPlayers}
      />
    );
  }
  for (let i = 1; i <= numberOfReservePlayers; i++) {
    elPlayers.push(
      <DropdownList
        className="selectingPlayers"
        id={"reserve_" + i}
        label={"Rezerwa " + i}
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
  a.download = "file.pdf";
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
  const font = await pdfDoc_setFont(pdfDoc, "/font/IBM.ttf");

  if (formData.secondRegistration) {
    const firstPage = await pdfDoc.copyPages(pdfDoc, [0]);
    pdfDoc.addPage(firstPage[0]);
  }

  const page = pdfDoc.getPage(0);
  pdfDoc_drawText_center(page, font, formData.name, [254, 1079], [523, 18]);
  pdfDoc_drawText_center(page, font, formData.club, [254, 1049], [256, 18]);
  pdfDoc_drawText_center(page, font, formData.date, [581, 1049], [196, 18]);

  formData.players.forEach((el, index) => {
    const y = 997 - 26 * index;
    pdfDoc_drawText_center(page, font, el.license, [101, y], [108, 18]);
    pdfDoc_drawText_center(page, font, el.name, [216, y], [561, 18]);
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  return blob;
};

const onReadDataFromForm = (): FormData => {
  let data: FormData = {
    name: document.querySelector<HTMLInputElement>("#nameInput")?.value ?? "",
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

const pdfDoc_drawText_center = (
  page: PDFPage,
  font: PDFFont,
  text: string,
  coords: [number, number],
  sizeCell: [number, number],
  color = rgb(0, 0, 0)
): void => {
  coords = [coords[0] * SCALE, coords[1] * SCALE];
  sizeCell = [sizeCell[0] * SCALE, sizeCell[1] * SCALE];

  const size = pdfDoc_getMaxFontSize(font, sizeCell[0], sizeCell[1], text);
  const x = (sizeCell[0] - font.widthOfTextAtSize(text, size)) / 2 + coords[0];
  page.drawText(text, { x, y: coords[1], size, font, color });
};

function pdfDoc_getMaxFontSize(
  font: PDFFont,
  maxWidth: number,
  maxHeight: number,
  text: string
): number {
  let size = 1;
  while (font.widthOfTextAtSize(text, size) < maxWidth && size < maxHeight) {
    size += 0.1;
  }
  return size;
}

const pdfDoc_setFont = async (
  pdfDoc: PDFDocument,
  fontPath: string
): Promise<PDFFont> => {
  const fontBytes = await fetch(fontPath).then((res) => res.arrayBuffer());
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fontBytes);
  return font;
};
