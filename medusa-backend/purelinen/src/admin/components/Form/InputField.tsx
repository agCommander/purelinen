import { Input, Label, clx } from '@medusajs/ui';
import { useController, ControllerRenderProps } from 'react-hook-form';

export interface InputFieldProps {
  className?: string;
  name: string;
  label?: string;
  type?: React.ComponentProps<typeof Input>['type'];
  labelProps?: React.ComponentProps<typeof Label>;
  inputProps?: Omit<
    React.ComponentProps<typeof Input>,
    'name' | 'id' | 'type' | keyof ControllerRenderProps
  >;
  isRequired?: boolean;
  suffix?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  className,
  name,
  label,
  type,
  labelProps,
  inputProps,
  isRequired,
  suffix,
}) => {
  const { field, fieldState } = useController<{ __name__: string }, '__name__'>(
    { name: name as '__name__' }
  );

  const inputEl = (
    <Input
      {...inputProps}
      {...field}
      value={field.value ?? ''}
      id={name}
      type={type}
      aria-invalid={Boolean(fieldState.error)}
      className={clx(
        {
          'pr-8':
            Boolean(suffix) &&
            (inputProps?.size === 'base' || !inputProps?.size),
          'pr-7': Boolean(suffix) && inputProps?.size === 'small',
        },
        inputProps?.className
      )}
    />
  );

  return (
    <div className={className}>
      {typeof label !== 'undefined' && (
        <Label
          {...labelProps}
          htmlFor={name}
          className={clx('block mb-1', labelProps?.className)}
        >
          {label}
          {isRequired ? <span className="text-red-primary">*</span> : ''}
        </Label>
      )}
      {suffix ? (
        <div className="relative">
          {inputEl}
          <div
            className={clx(
              'absolute bottom-0 right-0 flex items-center justify-center border-l',
              {
                'h-8 w-8': inputProps?.size === 'base' || !inputProps?.size,
                'h-7 w-7': inputProps?.size === 'small',
              }
            )}
          >
            <div className="h-fit w-fit rounded-sm outline-none font-normal font-sans txt-medium text-fg-muted dark:text-fg-muted-dark pointer-events-none select-none">
              {suffix}
            </div>
          </div>
        </div>
      ) : (
        inputEl
      )}
      {fieldState.error && (
        <div className="text-red-primary text-sm mt-1">
          {fieldState.error.message}
        </div>
      )}
    </div>
  );
};
