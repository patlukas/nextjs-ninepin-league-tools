import styles from "@/styles/Section.module.css";

const Section = ({
  children,
  title,
}: {
  children: JSX.Element[] | JSX.Element;
  title: string;
}) => {
  return (
    <div className={styles.container}>
      <p className={styles.title}>{title}</p>
      {children}
    </div>
  );
};

export default Section;
