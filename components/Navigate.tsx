import { useRouter } from "next/router";
import styles from "@/styles/Navigate.module.css";

export default function Navigate() {
  const router = useRouter();

  return (
    <div  className={styles.containerMain}>
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
      <div className={styles.container}>
        <Button
          title="Tworzenie Zapowiedzi Meczu"
          onClick={() => router.push("/tzm")}
          className={styles.option}
        />
        <Button
          title="Tworzenie Zapowiedzi YT"
          onClick={() => router.push("/tzy")}
          className={styles.option}
        />
        <Button
          title="Tworzenie Postu z Wynikami"
          onClick={() => router.push("/tpw")}
          className={styles.option}
        />
      </div>
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
