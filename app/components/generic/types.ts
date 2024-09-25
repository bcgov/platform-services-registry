import { Path, RegisterOptions, FieldValues } from 'react-hook-form';

export type HookFormRules<T extends FieldValues> = Omit<
  RegisterOptions<T, Path<T>>,
  'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
>;
