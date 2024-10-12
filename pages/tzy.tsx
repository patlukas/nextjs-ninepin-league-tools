import { useState } from "react";
import Title from "@/components/Title";
import Head from "next/head";
import styles from "@/styles/tpw.module.css";
import Navigate from "@/components/Navigate";
import Section from "@/components/Section";
import { DropdownList, InputButton, InputTextArea, InputDatetime } from "@/components/form";
import { promises as fs } from 'fs';
import ImageDownloadAndWait from "@/components/ImageDownloadAndWait";

type DropdownOption = {
    value: string;
    label: string;
};

export const getStaticProps = async () => {
    const fileContents = await fs.readFile(process.cwd() + "/public/teamOptions.json", 'utf8');
    const teamOptions = JSON.parse(fileContents);

    return {
        props: {
            teamOptions
        },
    };
};


export default function Tzm({ teamOptions }: { teamOptions: DropdownOption[], placeOptions: DropdownOption[] }) {

    const [imageSrc, setImageSrc] = useState<string | null | undefined>(null);

    const typeOptions: DropdownOption[] = getTypeOptions();
    
    return (
        <>
            <Head>
                <title>Tworzenie Zapowiedzi Youtube</title>
            </Head>
            <div className={styles.container}>
                <Title title="Tworzenie Zapowiedzi Youtube" />
                <Navigate />
                <FormTZM 
                    index={0}
                    typeOptions={typeOptions}
                    teamOptions={teamOptions}
                />
                <ImageDownloadAndWait
                    showWait={imageSrc === undefined}
                    showImage={imageSrc != undefined && imageSrc !== null}
                    imageSrc={imageSrc}
                    type={"TZY"}
                    onCreateImage={
                        () => {
                            onCreateImage(
                                setImageSrc, 
                                typeOptions
                            );
                        }
                    }
                />
            </div>
        </>
    )
}

const FormTZM = (
    {
        index,
        typeOptions, 
        teamOptions, 
    }: {
        index: number,
        typeOptions: DropdownOption[], 
        teamOptions: DropdownOption[], 
    }
) => {
    return (
        <>
            
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
            </Section>
            
            <div  className={styles.columnContainer}>
                <Team 
                    title="Gospodarz"
                    teams={teamOptions}
                    prefix={`_${index}_0`}
                />
                <Team 
                    title="Gość"
                    teams={teamOptions}
                    prefix={`_${index}_1`}
                />
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
    setImageSrc: React.Dispatch<React.SetStateAction<string | null | undefined>>, 
    typeOptions: DropdownOption[]
) => {
    setImageSrc(undefined);

    const typeIndex = document.querySelector<HTMLSelectElement>(`#_0_typeDropdown`)?.selectedIndex ?? 0;
    const datetime = document.querySelector<HTMLSelectElement>(`#_0_datetimeInput`)?.value ?? "";
    let list_value = ["", ""]
    let list_name = ["", ""]
    for(let j=0; j<2; j++) {
        list_value[j] = document.querySelector<HTMLSelectElement>(`#_0_${j}_crestDropdown`)?.value ?? "";
        list_name[j] = document.querySelector<HTMLSelectElement>(`#_0_${j}_nameInput`)?.value ?? "";
    }

    const announcementSettings = {
        title: typeOptions[typeIndex].label,
        type: typeOptions[typeIndex].value,
        datetime: changeFormatDate(datetime),
        list_value: list_value,
        list_name: list_name,
        dayOfWeek: date_getDayOfWeek(datetime)
    }

    const response = await fetch('/api/tzy-main', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            announcementSettings
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