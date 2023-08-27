import styles from "@/styles/Section.module.css";

const Section = ({
  children,
  title,
  className,
}: {
  children: JSX.Element[] | JSX.Element;
  title: string;
  className?: string
}) => {
  return (
    <div className={styles.container + " " + className}>
      <p className={styles.title}>{title}</p>
      {children}
    </div>
  );
};

export default Section;
