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
    <div>
      <label htmlFor={id}>{label}</label>
      <input type="text" name={id} id={id} defaultValue={defaultValue} />
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
  id: string;
  label: string;
  options: { value: string | number; label: string | number }[];
  onChange: (index: number) => void;
  className?: string;
}) => {
  const optionsElements = options.map((el, index) => (
    <option key={index} value={el.value}>
      {el.label}
    </option>
  ));
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <select
        name={id}
        id={id}
        className={className}
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
  console.log(todayDate);
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input type="date" name={id} id={id} defaultValue={todayDate} />
    </div>
  );
};

export const InputCheckbox = ({ id, label }: { id: string; label: string }) => {
  return (
    <div>
      <input type="checkbox" name={id} id={id} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

export const InputButton = ({ id, label, onClick }: { id: string; label: string, onClick: () => {} }) => {
  const clickFunction = (event: any) =>{
    event.preventDefault();
    onClick();
  }
    return (
        <input type="submit" id={id} value={label} onClick={clickFunction}/>
    );
  };
