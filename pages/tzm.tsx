import { useState } from "react";
import Title from "@/components/Title";
import Head from "next/head";
import styles from "@/styles/tpw.module.css";
import Navigate from "@/components/Navigate";
import Section from "@/components/Section";
import { DropdownList, InputButton, InputTextArea, InputDatetime } from "@/components/form";
import { promises as fs } from 'fs';

type DropdownOption = {
    value: string;
    label: string;
};

type DropdownOptionNumber = {
    value: number;
    label: string;
}

type AnnouncementSettings = {
    title: string;
    type: string;
    datetime: string;
    list_value: string[];
    list_name: string[];
    place: string;
    dayOfWeek: string;
};

export const getStaticProps = async () => {
    const fileContents = await fs.readFile(process.cwd() + "/public/teamOptions.json", 'utf8');
    const teamOptions = JSON.parse(fileContents);

    const placeContents = await fs.readFile(process.cwd() + "/public/placeOptions.json", 'utf8');
    const placeOptions = JSON.parse(placeContents);

    return {
        props: {
            teamOptions, 
            placeOptions
        },
    };
};


export default function Tzm({ teamOptions, placeOptions }: { teamOptions: DropdownOption[], placeOptions: DropdownOption[] }) {

    const [numberImages, setNumberImages] = useState<number>(1);
    const [imageSrc, setImageSrc] = useState<string | null>(null);

    const numberOptions: DropdownOptionNumber[] = getNumberOptions();
    const typeOptions: DropdownOption[] = getTypeOptions();
    
    return (
        <>
            <Head>
                <title>Tworzenie Zapowiedzi Meczu</title>
            </Head>
            <div className={styles.container}>
                <Title title="Tworzenie Zapowiedzi Meczu" />
                <Navigate />
                <Section title="Ustawienia" className={styles.typeContainer}>
                    <DropdownList
                        label="Ilość zapowiedzi w poście"
                        id="numberDropdown"
                        className="numberDropdown"
                        options={numberOptions}
                        onChange={index => {
                            setNumberImages(numberOptions[index].value)
                        }}
                    />
                </Section>
                {[...Array(numberImages)].map((_, i) => (
                    <FormAnnouncement 
                        index={i}
                        typeOptions={typeOptions}
                        placeOptions={placeOptions}
                        teamOptions={teamOptions}
                    />
                ))}
                <InputButton
                    id="btn"
                    label="Stwórz obraz"
                    onClick={() => {
                        onCreateImage(
                            setImageSrc, 
                            numberImages,
                            typeOptions
                        );
                    }}
                />
                {imageSrc && <img src={imageSrc} alt="Połączony obraz" width="600" />}
            </div>
        </>
    )
}

const FormAnnouncement = (
    {
        index,
        typeOptions, 
        placeOptions, 
        teamOptions, 
    }: {
        index: number,
        typeOptions: DropdownOption[], 
        placeOptions: DropdownOption[], 
        teamOptions: DropdownOption[], 
    }
) => {
    return (
        <Section title={`${index+1} obraz`} className={styles.typeContainer}>
            <div className={styles.columnContainer}>
                <Team 
                    title="Gospodarz"
                    teams={teamOptions}
                    prefix={`_${index}_0`}
                />
                <Section title="Ustawienia" className={styles.column}>
                    <DropdownList
                        label="Rodzaj rozgrywek"
                        id={`_${index}_typeDropdown`}
                        className="typeDropdown"
                        options={typeOptions}
                    />
                    <InputDatetime 
                        id={`_${index}_datetimeInput`}
                        label="Data"
                    />
                    <DropdownList
                        label="Kręgielnia"
                        id={`_${index}_placeDropdown`}
                        className="placeDropdown"
                        options={placeOptions}
                    />
                </Section>
                
                <Team 
                    title="Gość"
                    teams={teamOptions}
                    prefix={`_${index}_1`}
                />
            </div>
        </Section>
    )
}

const Team = ({
    title,
    teams,
    prefix,
}: {
    title: string,
    teams: DropdownOption[],
    prefix: string,
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
        </Section>
    )
}


const onCreateImage = async (
    setImageSrc: React.Dispatch<React.SetStateAction<string | null>>, 
    numberImages: number,
    typeOptions: DropdownOption[]
) => {
    let list_announcementSettings: AnnouncementSettings[] = []

    for(let i=0; i<numberImages; i++) {
        const typeIndex = document.querySelector<HTMLSelectElement>(`#_${i}_typeDropdown`)?.selectedIndex ?? 0;
        const datetime = document.querySelector<HTMLSelectElement>(`#_${i}_datetimeInput`)?.value ?? "";
        const placeValue = document.querySelector<HTMLSelectElement>(`#_${i}_placeDropdown`)?.value ?? 0;
        let list_value = ["", ""]
        let list_name = ["", ""]
        for(let j=0; j<2; j++) {
            list_value[j] = document.querySelector<HTMLSelectElement>(`#_${i}_${j}_crestDropdown`)?.value ?? "";
            list_name[j] = document.querySelector<HTMLSelectElement>(`#_${i}_${j}_nameInput`)?.value ?? "";
        }
        list_announcementSettings.push({
            title: typeOptions[typeIndex].label,
            type: typeOptions[typeIndex].value,
            datetime: changeFormatDate(datetime),
            list_value: list_value,
            list_name: list_name,
            place: placeValue.toString(),
            dayOfWeek: date_getDayOfWeek(datetime)
        })
    }

    const response = await fetch('/api/tzm-main', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            list_createAnnouncement: list_announcementSettings
        }),
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setImageSrc(url);
}

const changeFormatDate = (datetimeValue: string) => {
    const date = new Date(datetimeValue);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;      
};

const date_getDayOfWeek = (dateValue: string) => {
    if (dateValue) {
        const date = new Date(dateValue);
        const daysOfWeek = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
        const dayOfWeek = daysOfWeek[date.getDay()];
        return dayOfWeek;
    } 
    return "";
}


const getTypeOptions = (): DropdownOption[] => {
    return [
        {
            value: "sm",
            label: "Superliga Mężczyzn"
        },
        {
            value: "sk",
            label: "Superliga Kobiet"
        },
        {
            value: "2liga",
            label: "2. Liga"
        },
        {
            value: "clm",
            label: "Centralna Liga Młodzieżowa"
        },
    ];
};

const getNumberOptions = (): DropdownOptionNumber[] => {
    let listOptions: DropdownOptionNumber[] = []
    for(let i=1; i<4; i++) {
        listOptions.push({
            value: i,
            label: `${i} zapoiwedź`
        })
    }
    return listOptions;
};