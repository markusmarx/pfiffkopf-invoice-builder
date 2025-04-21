interface CustomInputProps {
    value?: string;
    defaultValue?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    error?: string;
  }
  
  export function CustomInput({
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    error,
  }: CustomInputProps) {
    return (
      <div>
        <input
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {error && <div>{error}</div>}
      </div>
    );
  }