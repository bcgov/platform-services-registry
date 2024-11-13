import FormTextInput from '@/components/generic/input/FormTextInput';

export default function AccountCodingInput({
  title,
  name,
  length,
  placeholder,
  setAccountCoding,
  accountCoding,
  disabled,
  alphanumericRegex,
  infoText,
}: {
  title: string;
  name: string;
  placeholder: string;
  length: number;
  setAccountCoding: any;
  accountCoding: any;
  disabled?: boolean;
  alphanumericRegex: RegExp;
  infoText: string;
}) {
  return (
    <div className="relative mb-3" data-te-input-wrapper-init>
      <FormTextInput
        label={title}
        info={infoText}
        name={name}
        onChange={(e) => {
          const { value } = e.target;
          // Update only if the input is empty (to clear the field) or if it matches the alphanumeric pattern
          if (value === '' || alphanumericRegex.test(value)) {
            setAccountCoding((prev: any) => ({ ...prev, [name]: value }));
          }
        }}
        value={accountCoding[name].toUpperCase()}
        placeholder={placeholder}
        maxLength={length}
        disabled={disabled}
      />
    </div>
  );
}
