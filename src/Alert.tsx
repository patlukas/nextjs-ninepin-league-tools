import styles from "@/styles/alert.module.css";

export default function Alert({
  text,
  show,
  onClick,
}: {
  text: string;
  show: boolean;
  onClick: () => void;
}) {
  if (!show) return <></>;
  return (
    <div className={styles.container} onClick={onClick}>
      <p className={styles.text}>{text}</p>
    </div>
  );
}
