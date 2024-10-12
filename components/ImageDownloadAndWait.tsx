import styles from "@/styles/ImageDownloadAndWait.module.css";
import { InputButton } from "@/components/form";

export default function ImageDownloadAndWait({
    showWait,
    showImage,
    imageSrc,
    type,
    btn1label = "Stwórz obraz",
    onCreateImage
  }: {
    showWait: boolean;
    showImage: boolean;
    imageSrc: string | undefined | null,
    type: string,
    btn1label?: string,
    onCreateImage: () => void
  }) {
    const createBtn = (
        <InputButton
            id="btn"
            label={btn1label}
            onClick={onCreateImage}
        />
    )
    if(showWait) {
        return (
            <div className={styles.loader}></div>
        )
    }
    if(showImage && typeof imageSrc === "string") {
        return (
            <>
                <div className={styles.btnContainer} >
                    {createBtn}
                    <InputButton
                        id="btn"
                        label="Pobierz obraz"
                        onClick={() => onDownloadImage(imageSrc, type)}
                    />
                </div>
                <img src={imageSrc} className={styles.image} alt="Połączony obraz"/>
                
            </>
        )
    }
    return createBtn
}

const onDownloadImage = (href_name: string, type: string) => {
    const link = document.createElement('a');
    link.href = href_name;
    link.download = `${type}__${getCurrentDateTime()}.png`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
}

function getCurrentDateTime() {
    const now = new Date();
  
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); 
    const day = String(now.getDate()).padStart(2, '0');
  
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  }