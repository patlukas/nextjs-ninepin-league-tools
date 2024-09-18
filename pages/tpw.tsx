import { useState } from "react";
import Title from "@/components/Title";
import Head from "next/head";
import styles from "@/styles/tpw.module.css";
import Navigate from "@/components/Navigate";
import Section from "@/components/Section";
import { DropdownList, InputButton, InputDate, InputNumber, InputTextArea } from "@/components/form";
import { promises as fs } from 'fs';


type TypeOption = {
    value: string;
    label: string;
    numberOfPlayersPlaying: number;
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
    console.log(data)
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
    const [imageSrc, setImageSrc] = useState<string | null>(null);

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
                <div className={styles.columnContainer}>
                    <Team 
                        title="Gospodarz"
                        teams={teams}
                        prefix={"home"}
                    />
                    <Team 
                        title="Gość"
                        teams={teams}
                        prefix={"guest"}
                    />
                </div>
                <InputButton
                    id="btn"
                    label="Stwórz obraz"
                    onClick={() => {
                        onCreateImage(
                            setImageSrc, 
                            typeOptions[typeIndex], 
                            roundOptions[roundIndex].label, 
                            pdOptions[pdIndex].list_value,
                            psOptions[psIndex].list_value
                        )
                    }}
                />
                {imageSrc && <img src={imageSrc} alt="Połączony obraz" width="600" height="600"/>}
            </div>
        </>
    )
}


const Team = ({
    title,
    teams,
    prefix,
}: {
    title: string,
    teams: DropdownOption[],
    prefix: string
}) => {
    const [teamIndex, setTeamIndex] = useState(0);

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
        </Section>
    )
}


const onCreateImage = async (
    setImageSrc: React.Dispatch<React.SetStateAction<string | null>>, 
    type: TypeOption,
    round: string,
    list_pd: string[],
    list_ps: string[]
) => {
    let date = document.querySelector<HTMLInputElement>("#dateInput")?.value ?? ""
    const response = await fetch('/api/tpw-main', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            list_value: [
                document.querySelector<HTMLInputElement>("#home_crestDropdown")?.value ?? "",
                document.querySelector<HTMLInputElement>("#guest_crestDropdown")?.value ?? ""
            ],
            title: type.label,
            date: changeFormatDate(date),
            round: `${round} kolejka`,
            list_name: [
                document.querySelector<HTMLInputElement>("#home_nameInput")?.value ?? "",
                document.querySelector<HTMLInputElement>("#guest_nameInput")?.value ?? ""
            ],
            type: type.value,
            list_pd: list_pd,
            list_ps: list_ps,
            list_sum: [
                document.querySelector<HTMLInputElement>("#home_sumInput")?.value ?? "",
                document.querySelector<HTMLInputElement>("#guest_sumInput")?.value ?? ""
            ]
        }),
      });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setImageSrc(url);
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
    const list = ["I", "II", "III", "IV", "V"];
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
        numberOfPlayersPlaying: 6,
        numberOfReservePlayers: 4,
        pd: 8,
        ps: 24
      },
      {
        value: "sk",
        label: "Superliga Kobiet",
        numberOfPlayersPlaying: 6,
        numberOfReservePlayers: 4,
        pd: 8,
        ps: 24
      },
      {
        value: "2liga",
        label: "2. Liga",
        numberOfPlayersPlaying: 4,
        numberOfReservePlayers: 3,
        pd: 6,
        ps: 16
      },
      {
        value: "clm",
        label: "Centralna Liga Młodzieżowa",
        numberOfPlayersPlaying: 4,
        numberOfReservePlayers: 3,
        pd: 6,
        ps: 16
      },
    ];
  };