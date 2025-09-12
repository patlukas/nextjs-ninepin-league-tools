import { useState } from "react";
import Title from "@/components/Title";
import Head from "next/head";
import styles from "@/styles/tpw.module.css";
import Navigate from "@/components/Navigate";
import Section from "@/components/Section";
import { DropdownList, InputButton, InputButtonSmall, InputDate, InputNumber, InputText, InputTextArea } from "@/components/form";
import { promises as fs } from 'fs';
import ImageDownloadAndWait from "@/components/ImageDownloadAndWait";


type TypeOption = {
    value: string;
    label: string;
    numberOfDuels: number;
    numberOfReservePlayers: number;
    pd: number;
    ps: number;
};

type DropdownOption = {
    value: string;
    label: string;
};

type DropdownOptionLeague = {
    value: string;
    label: string;
    home: number;
    guest: number;
    list_value: string[]
};

export const getStaticProps = async () => {
    const fileContents = await fs.readFile(process.cwd() + "/public/teamOptions.json", 'utf8');
    const data = JSON.parse(fileContents);
    return {
      props: {
        teams: data,
      },
    };
  };


export default function Tpw({ teams }: { teams: DropdownOption[] }) {

    const [typeIndex, setTypeIndex] = useState(0);
    const [roundIndex, setRoundIndex] = useState(0);
    const [pdIndex, setPdIndex] = useState(0);
    const [psIndex, setPsIndex] = useState(0);
    const [imageSrc, setImageSrc] = useState<string | null | undefined>(null);
    const [imageSrc2, setImageSrc2] = useState<string | null | undefined>(null);
    const [sheetOption, setSheetOption] = useState<DropdownOption[]>([]);
    const [googleSheetTitle, setGoogleSheetTitle] = useState<string>("");

    const typeOptions: TypeOption[] = getTypeOptions();
    const roundOptions: DropdownOption[] = getRoundOptions();
    const pdOptions: DropdownOptionLeague[] = getLeaguePointsOptions(typeOptions[typeIndex].pd);
    const psOptions: DropdownOptionLeague[] = getLeaguePointsOptions(typeOptions[typeIndex].ps);
    
    return (
        <>
            <Head>
                <title>Tworzenie Postu z Wynikami</title>
            </Head>
            <div className={styles.container}>
                <Title title="Tworzenie Postu z Wynikami" />
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
                        label="Numer kolejki"
                        id="typeDropdown"
                        className="roundDropdown"
                        options={roundOptions}
                        onChange={setRoundIndex}
                    />
                    <InputDate 
                        id="dateInput"
                        label="Data"
                    />
                    <DropdownList
                        label="Punkty drużynowe"
                        id="pdDropdown"
                        className="pdDropdown"
                        options={pdOptions}
                        onChange={setPdIndex}
                    />
                    <DropdownList
                        label="Punkty setowe"
                        id="psDropdown"
                        className="psDropdown"
                        options={psOptions}
                        onChange={setPsIndex}
                    />
                </Section>
                <Section title="Ładowanie danych" className={styles.typeContainerBig}>
                    <InputText 
                        label="Link do GoogleSheet"
                        id="urlInput"
                    />
                    <InputButtonSmall
                        id="btnUrl"
                        label="Pobierz listę skoroszytów"
                        onClick={async () => onGetListSheet(setSheetOption, setGoogleSheetTitle)}
                    />
                    <div></div>
                    <DropdownList
                        label={`Lista skoroszytów w arkuszu: \r\n${googleSheetTitle}`}
                        id="sheetDropdown"
                        className="sheetDropdown"
                        options={sheetOption}
                        key={sheetOption.length}
                    />
                    <InputButtonSmall
                        id="btnUrl"
                        label="Załaduj dane ze skoroszytu"
                        onClick={() => setValuesFromGoogleSheet(typeOptions[typeIndex].numberOfDuels)}
                    />
                </Section>
                <div className={styles.columnContainer}>
                    <Team 
                        title="Gospodarz"
                        teams={teams}
                        prefix={"_0"}
                        numberOfDuels={typeOptions[typeIndex].numberOfDuels}
                    />
                    <Team 
                        title="Gość"
                        teams={teams}
                        prefix={"_1"}
                        numberOfDuels={typeOptions[typeIndex].numberOfDuels}
                    />
                </div>
                
                <ImageDownloadAndWait
                    showWait={imageSrc === undefined}
                    showImage={imageSrc != undefined && imageSrc !== null}
                    imageSrc={imageSrc}
                    type={"TPW"}
                    btn1label={"Stwórz obraz z wynikami drużyn"}
                    onCreateImage={
                        () => {
                            onCreateImage(
                                setImageSrc, 
                                typeOptions[typeIndex], 
                                roundOptions[roundIndex].label, 
                                pdOptions,
                                psOptions
                            )
                        }
                    }
                />

                <ImageDownloadAndWait
                    showWait={imageSrc2 === undefined}
                    showImage={imageSrc2 != undefined && imageSrc2 !== null}
                    imageSrc={imageSrc2}
                    type={"TPW2"}
                    btn1label={"Stwórz obraz z wynikami graczy"}
                    onCreateImage={
                        () => {
                            onCreateImage2(
                                setImageSrc2, 
                                typeOptions[typeIndex], 
                                roundOptions[roundIndex].label, 
                                pdOptions,
                                psOptions
                            )
                        }
                    }
                />
            </div>
        </>
    )
}


const Team = ({
    title,
    teams,
    prefix,
    numberOfDuels
}: {
    title: string,
    teams: DropdownOption[],
    prefix: string,
    numberOfDuels: number
}) => {
    const [teamIndex, setTeamIndex] = useState(0);

    let duelsEl = []
    for(let i=0; i<numberOfDuels; i++) {
        duelsEl.push(
            <Player 
                key={`${prefix}_${i}`}
                label={`Zawodnik ${i+1}`}
                prefix={`${prefix}_${i}`}
            />
        )
    }

    return (
        <Section title={title} className={styles.column}>
            <DropdownList
                label="Herb"
                id={`${prefix}_crestDropdown`}
                className="crestDropdown"
                options={teams}
                onChange={setTeamIndex}
            />
            <InputTextArea
                id={`${prefix}_nameInput`}
                label="Nazwa drużyny"
                key={`${prefix}_nameInput_${teamIndex}`}
                defaultValue={teams[teamIndex].label}
            />
            <InputNumber
                id={`${prefix}_sumInput`}
                label="Suma"
                min={0}
            />
            <div>{duelsEl}</div>
        </Section>
    )
}

const Player = ({prefix, label} : {prefix: string, label: string}) => {
    return (
        <Section title={label} className={styles.typeContainer}>
            <div>
                <div className={styles.column}>
                    <InputText id={`${prefix}_0_name`} label={""} placeholder={"Zawodnik 1"}/>
                    <InputText id={`${prefix}_1_name`} label={""} placeholder={"Zawodnik 2"}/>
                    <InputText id={`${prefix}_2_name`} label={""} placeholder={"Zawodnik 3"}/>
                </div>
                <div className={styles.columnPD}>
                    <InputNumber 
                        id={`${prefix}_pd`}
                        label={``}
                        placeholder={"PD"}
                    /> 
                </div>
            </div>
            

            <Lane prefix={`${prefix}_0`}/>
            <Lane prefix={`${prefix}_1`}/>
            <Lane prefix={`${prefix}_2`}/>
            <Lane prefix={`${prefix}_3`}/>
            <Lane prefix={`${prefix}_4`}/>

        </Section>
    )
}

const Lane = ({prefix} : {prefix: string}) => {
    return (
        <div className={styles.columnContainerSmall}>
            <div className={styles.columnSmall}>
                <InputNumber 
                    id={`${prefix}_p`}
                    label={``}
                    placeholder={"P"}
                />
            </div>
            <div className={styles.columnSmall}>
                <InputNumber 
                    id={`${prefix}_z`}
                    label={``}
                    placeholder={"Z"}
                />
            </div>
            <div className={styles.columnSmall}>
                <InputNumber 
                    id={`${prefix}_x`}
                    label={``}
                    placeholder={"X"}
                />
            </div>
            <div className={styles.columnSmall}>
                <InputNumber 
                    id={`${prefix}_s`}
                    label={``}
                    placeholder={"Suma"}
                />
            </div>
            <div className={styles.columnSmall}>
                <InputNumber 
                    id={`${prefix}_ps`}
                    label={``}
                    step={0.5}
                    placeholder={"PS"}
                />
            </div>
            <div className={styles.clear}></div>
        </div>
    )
}


const onCreateImage = async (
    setImageSrc: React.Dispatch<React.SetStateAction<string | null | undefined>>, 
    type: TypeOption,
    round: string,
    pdOptions: DropdownOptionLeague[],
    psOptions: DropdownOptionLeague[]
) => {
    setImageSrc(undefined);
    const psIndex = document.querySelector<HTMLSelectElement>(`#psDropdown`)?.selectedIndex ?? 0;
    const pdIndex = document.querySelector<HTMLSelectElement>(`#pdDropdown`)?.selectedIndex ?? 0;

    
    let date = document.querySelector<HTMLInputElement>("#dateInput")?.value ?? ""
    const response = await fetch('/api/tpw-main', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            list_value: [
                document.querySelector<HTMLInputElement>("#_0_crestDropdown")?.value ?? "",
                document.querySelector<HTMLInputElement>("#_1_crestDropdown")?.value ?? ""
            ],
            title: type.label,
            date: changeFormatDate(date),
            round: `${round} kolejka`,
            list_name: [
                document.querySelector<HTMLInputElement>("#_0_nameInput")?.value ?? "",
                document.querySelector<HTMLInputElement>("#_1_nameInput")?.value ?? ""
            ],
            type: type.value,
            list_pd: pdOptions[pdIndex].list_value,
            list_ps: psOptions[psIndex].list_value,
            list_sum: [
                document.querySelector<HTMLInputElement>("#_0_sumInput")?.value ?? "",
                document.querySelector<HTMLInputElement>("#_1_sumInput")?.value ?? ""
            ],
            players: [
                getPlayersValue(type.numberOfDuels, 0),
                getPlayersValue(type.numberOfDuels, 1)
            ]
        }),
      });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setImageSrc(url);
}

const onCreateImage2 = async (
    setImageSrc: React.Dispatch<React.SetStateAction<string | null | undefined>>, 
    type: TypeOption,
    round: string,
    pdOptions: DropdownOptionLeague[],
    psOptions: DropdownOptionLeague[]
) => {
    setImageSrc(undefined);
    const psIndex = document.querySelector<HTMLSelectElement>(`#psDropdown`)?.selectedIndex ?? 0;
    const pdIndex = document.querySelector<HTMLSelectElement>(`#pdDropdown`)?.selectedIndex ?? 0;

    
    let date = document.querySelector<HTMLInputElement>("#dateInput")?.value ?? ""
    const response = await fetch('/api/tpw-second', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            list_value: [
                document.querySelector<HTMLInputElement>("#_0_crestDropdown")?.value ?? "",
                document.querySelector<HTMLInputElement>("#_1_crestDropdown")?.value ?? ""
            ],
            date: changeFormatDate(date),
            round: `${round} kolejka`,
            title: type.label,
            list_name: [
                document.querySelector<HTMLInputElement>("#_0_nameInput")?.value ?? "",
                document.querySelector<HTMLInputElement>("#_1_nameInput")?.value ?? ""
            ],
            players: [
                getPlayersValue(type.numberOfDuels, 0),
                getPlayersValue(type.numberOfDuels, 1)
            ]
        }),
      });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setImageSrc(url);
}

const getPlayersValue = (numberOfDuels: number, indexTeam: number) => {
    let list_player_result = []
    for(let i=0; i<numberOfDuels; i++) {
        let name = []
        let results = []
        for(let j=0; j<3; j++) {
            name.push(
                document.querySelector<HTMLInputElement>(`#_${indexTeam}_${i}_${j}_name`)?.value ?? "",
            )
        }
        for(let j=0; j<5; j++) {
            results.push(
                {
                    p: document.querySelector<HTMLInputElement>(`#_${indexTeam}_${i}_${j}_p`)?.value ?? "",
                    z: document.querySelector<HTMLInputElement>(`#_${indexTeam}_${i}_${j}_z`)?.value ?? "",
                    x: document.querySelector<HTMLInputElement>(`#_${indexTeam}_${i}_${j}_x`)?.value ?? "",
                    s: document.querySelector<HTMLInputElement>(`#_${indexTeam}_${i}_${j}_s`)?.value ?? "",
                    ps: document.querySelector<HTMLInputElement>(`#_${indexTeam}_${i}_${j}_ps`)?.value ?? "",
                }
            )
        }
        list_player_result.push(
            {
                name,
                pd: document.querySelector<HTMLInputElement>(`#_${indexTeam}_${i}_pd`)?.value ?? "",
                results
            }
        )
    }
    return list_player_result
}

const changeFormatDate = (date: string) => {
    const date_split = date.split("-")
    if(date_split.length != 3) return date
    return `${date_split[2]}.${date_split[1]}.${date_split[0]}`
}


const getLeaguePointsOptions = (maxPoints: number): DropdownOptionLeague[] => {
    let resultList: DropdownOptionLeague[] = [];
    
    const createList = (startValue: number) => {
        for(let x=startValue; x<=maxPoints; x+=1) {
            resultList.push(
                {
                    value: `${maxPoints-x} - ${x}`,
                    label: `${maxPoints-x}\t-\t${x}`,
                    home: maxPoints - x,
                    guest: x,
                    list_value: [(maxPoints-x).toString(), x.toString()]
                }
            )
        }
    }

    createList(0)
    createList(0.5)
    return resultList
};

const getRoundOptions = (): DropdownOption[] => {
    const list = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];
    let returnList: DropdownOption[] = []
    list.forEach(l => {
        returnList.push({
            value: l,
            label: l
        })
    })
    return returnList
  };

const getTypeOptions = (): TypeOption[] => {
    return [
      {
        value: "sm",
        label: "Superliga Mężczyzn",
        numberOfDuels: 6,
        numberOfReservePlayers: 4,
        pd: 8,
        ps: 24
      },
      {
        value: "sk",
        label: "Superliga Kobiet",
        numberOfDuels: 6,
        numberOfReservePlayers: 4,
        pd: 8,
        ps: 24
      },
      {
        value: "2liga",
        label: "2. Liga",
        numberOfDuels: 4,
        numberOfReservePlayers: 3,
        pd: 6,
        ps: 16
      },
      {
        value: "clm",
        label: "Centralna Liga Młodzieżowa",
        numberOfDuels: 4,
        numberOfReservePlayers: 3,
        pd: 6,
        ps: 16
      },
    ];
};

const onGetListSheet = async (setListSheet: (_: DropdownOption[]) => void, setGoogleSheetTitle: (_: string) => void) => {
    setListSheet([])
    setGoogleSheetTitle("")
    const urlEl = document.querySelector<HTMLInputElement>(`#urlInput`);
    if(urlEl === undefined || urlEl === null) {
        return
    }
    const url = urlEl.value
    
    const response = await fetch('/api/get-list-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({url}),
    });
    if(response.ok) {
        const result_json = await response.json()
        setGoogleSheetTitle(result_json.title)
        setListSheet(result_json.list_sheet)
    }
    else {
        const err = await response.json()
        let message_pl = ""
        if (err.status == "FAILED_PRECONDITION") {
            message_pl = "\n\nMożliwe, że link prowadzi do arkusza zapisanego w formacie \".XLSX\" zamaist w formacie Google Sheet"
        }
        alert(`${err.code}: ${err.status}\n${err.message}${message_pl}`)
    }
}

const onGetDataFromGoogleSheet = async (url: string, numberOfDuels: number) => {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Błąd podczas pobierania danych');
        }
    
        const csvData = await response.text();
    
        const rows = csvData.split('\n');
        let rows_split: string[][] = []
        rows.forEach(row => {
            const row_split = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            rows_split.push(row_split)
        })
        const results = [
            googleSheet__getTeamResults(rows_split, 0, numberOfDuels),
            googleSheet__getTeamResults(rows_split, 1, numberOfDuels)
        ]
        return {
            date: rows_split[5][16],
            results
        };
      } catch (error) {
        console.error('Błąd:', error);
      }
}

const googleSheet__getTeamResults = (googleSheet: string[][], indexTeam: number, numberOfDuels: number) => {
    const additionalColumnNumber = indexTeam === 0 ? 0 : 15
    const pmCol = indexTeam === 0 ? 12 : 14
    let players = []
    for(let i=0; i<numberOfDuels; i++) {
        players.push(googleSheet__getPlayerResults(googleSheet, indexTeam, i))
    }
    const r = numberOfDuels * 7
    let result = {
        name: googleSheet[12][4+additionalColumnNumber] + "\n" + googleSheet[13][4+additionalColumnNumber],
        sum: googleSheet[14 + r][7 + additionalColumnNumber],
        ps: removeQuotation(googleSheet[14 + r][8 + additionalColumnNumber]),
        pd: removeQuotation(googleSheet[16 + r][pmCol]),
        players: players
    }
    return result
}

const googleSheet__getPlayerResults = (googleSheet: string[][], indexTeam: number, indexPlayer: number) => {
    const c = indexTeam * 15 // additional column number
    const r = indexPlayer * 7 // additional row number
    let player_results = []
    for(let i=0; i<5; i++) {
        player_results.push({
            p: googleSheet[15 + i + r][6+c],
            z: googleSheet[15 + i + r][5+c],
            x: googleSheet[15 + i + r][4+c],
            s: googleSheet[15 + i + r][7+c],
            ps: removeQuotation(googleSheet[15 + i + r][8+c]),
        })
    }
    let result = {
        name: [
            googleSheet[14 + r][0 + c],
            googleSheet[16 + r][0 + c],
            googleSheet[18 + r][0 + c],
        ],
        results: player_results,
        pd: removeQuotation(googleSheet[15 + r][10 + c]),
    }
    return result
}

const removeQuotation = (value: string): string => {
    return parseFloat(value.replaceAll('"', '').replace(",", ".")).toString()
}

const setValuesFromGoogleSheet = async (numberOfDuels: number) => {
    const urlEl = document.querySelector<HTMLInputElement>(`#sheetDropdown`);
    if(urlEl === undefined || urlEl === null) return
    const url = urlEl.value

    const data = await onGetDataFromGoogleSheet(url, numberOfDuels)
    if(data === undefined) return
    const values = data.results

    const dateInputElement = document.querySelector<HTMLInputElement>(`#dateInput`);
    if (dateInputElement) dateInputElement.value = date2dateValue(data.date);

    for(let i=0; i<2; i++) {
        const sumInputElement = document.querySelector<HTMLInputElement>(`#_${i}_sumInput`);
        if (sumInputElement) sumInputElement.value = values[i].sum;

        const nameInputElement = document.querySelector<HTMLInputElement>(`#_${i}_nameInput`);
        if (nameInputElement) nameInputElement.value = values[i].name;

        changeSelectedDropdownElement(`#_${i}_crestDropdown`, values[i].name)

        for(let j=0; j<numberOfDuels; j++) {
            const pdInputElement = document.querySelector<HTMLInputElement>(`#_${i}_${j}_pd`);
            if (pdInputElement) pdInputElement.value = values[i].players[j].pd;

            for(let k=0; k<3; k++) {
                const playerNameInputElement = document.querySelector<HTMLInputElement>(`#_${i}_${j}_${k}_name`);
                if (playerNameInputElement) playerNameInputElement.value = values[i].players[j].name[k];
            }
            for(let k=0; k<5; k++) {
                const pInputElement = document.querySelector<HTMLInputElement>(`#_${i}_${j}_${k}_p`);
                if (pInputElement) pInputElement.value = values[i].players[j].results[k].p;

                const zInputElement = document.querySelector<HTMLInputElement>(`#_${i}_${j}_${k}_z`);
                if (zInputElement) zInputElement.value = values[i].players[j].results[k].z;

                const xInputElement = document.querySelector<HTMLInputElement>(`#_${i}_${j}_${k}_x`);
                if (xInputElement) xInputElement.value = values[i].players[j].results[k].x;

                const sInputElement = document.querySelector<HTMLInputElement>(`#_${i}_${j}_${k}_s`);
                if (sInputElement) sInputElement.value = values[i].players[j].results[k].s;

                const psInputElement = document.querySelector<HTMLInputElement>(`#_${i}_${j}_${k}_ps`);
                if (psInputElement) psInputElement.value = values[i].players[j].results[k].ps;
            }
        }
    }
    changeSelectedDropdownElement(`#pdDropdown`, values[0].pd + "\t-\t" + values[1].pd)
    changeSelectedDropdownElement(`#psDropdown`, values[0].ps + "\t-\t" + values[1].ps)

}

const changeSelectedDropdownElement = (name: string, value: string) => {
    var dropdown = document.querySelector<HTMLSelectElement>(name);
    if(dropdown) {
        for (let j = 0; j < dropdown.options.length; j++) {
            if (dropdown.options[j].innerHTML == value) {
                dropdown.selectedIndex = j;
                dropdown.classList.remove(styles.dropdown_option_now_exists)
                return; 
            }
        }
        dropdown.selectedIndex = 0;
        dropdown.classList.add(styles.dropdown_option_now_exists)
        alert(`Nie znaleziono opcji "${value}"`)
    }
}

const date2dateValue = (date: string) => {
    const d = date.split(".")
    return d[2] + "-" + d[1] + "-" + d[0]
}