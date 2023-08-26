import styles from "@/styles/Title.module.css";

const Title = ({title}: {title: string}) => {
  return (
    <div className={styles.container}>
      <p>{title}</p>
    </div>
  );
};

export default Title;
