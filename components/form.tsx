import styles from '@/styles/form.module.css' 

export const InputText = ({
  id,
  label,
  defaultValue,
}: {
  id: string;
  label: string;
  defaultValue?: string;
}) => {
  if (defaultValue === undefined) defaultValue = "";
  return (
    <div className={styles.container}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <input type="text" name={id} id={id} defaultValue={defaultValue} className={styles.input}/>
    </div>
  );
};

export const DropdownList = ({
  id,
  className,
  label,
  options,
  onChange,
}: {
  id?: string;
  label: string;
  options: { value: string | number; label: string | number }[];
  onChange: (index: number) => void;
  className?: string;
}) => {
  const optionsElements = options.map((el, index) => (
    <option key={index} value={el.value} className={styles.pointer}>
      {el.label}
    </option>
  ));
  return (
    <div className={styles.container}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <select
        name={id}
        id={id}
        className={className + " " + styles.input + " " + styles.pointer}
        onChange={(e) => onChange(e.target.selectedIndex)}
      >
        {optionsElements}
      </select>
    </div>
  );
};

DropdownList.defaultProps = {
  onChange: (_: number) => {},
};

export const InputDate = ({ id, label }: { id: string; label: string }) => {
  var todayDate = new Date().toISOString().slice(0, 10);
  return (
    <div className={styles.container}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <input type="date" name={id} id={id} className={styles.input+" "+styles.pointer} defaultValue={todayDate} />
    </div>
  );
};

export const InputCheckbox = ({ id, label }: { id: string; label: string }) => {
  return (
    <div className={styles.container}>
      <input type="checkbox" className={styles.pointer} name={id} id={id} />
      <label htmlFor={id} className={styles.labelCheckbox}>{label}</label>
    </div>
  );
};

export const InputButton = ({ id, label, onClick }: { id: string; label: string, onClick: () => void }) => {
  const clickFunction = (event: any) =>{
    event.preventDefault();
    onClick();
  }
    return (
        <input type="submit" id={id} value={label} onClick={clickFunction} className={styles.btn} />
    );
  };
