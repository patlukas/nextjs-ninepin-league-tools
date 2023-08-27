import { useRouter } from "next/router";
import styles from "@/styles/Navigate.module.css";

export default function Navigate() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <Button
        title="Drukowanie Dokumentów Meczowych"
        onClick={() => router.push("/")}
        className={styles.option}
      />
      <Button
        title="Uzupełnianie Elektronicznego Protokołu"
        onClick={() => router.push("/uep")}
        className={styles.option}
      />
    </div>
  );
}

const Button = ({
  title,
  onClick,
  className,
}: {
  title: string;
  onClick: () => void;
  className: string;
}) => {
  return (
    <div onClick={onClick} className={className}>
      <p className={styles.optionText}>{title}</p>
    </div>
  );
};
