import styles from "@/styles/TextWithCopyBtn.module.css";
import { InputButton } from "@/components/form";

export default function TextWithCopyBtn({
    value,
    labelBtn,
    afterCopy
  }: {
    labelBtn: string;
    value: string | undefined | null,
    afterCopy: () => void
  }) {
    if(value === undefined || value === null) return <></>;

    const copyValueToClipboard = () => {
        navigator.clipboard.writeText(value)
        .then(afterCopy)
    }

    return (
        <div className={styles.container} >
            <p className={styles.pValue}>{value}</p>
            <InputButton
                id="btn"
                label={labelBtn}
                onClick={copyValueToClipboard}
            />
        </div>
    )
}