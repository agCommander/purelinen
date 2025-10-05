import { Textarea, Label, clx } from '@medusajs/ui';
import { useController, ControllerRenderProps } from 'react-hook-form';

export interface TextareaFieldProps {
  className?: string;
  name: string;
  label?: string;
  labelProps?: React.ComponentProps<typeof Label>;
  textareaProps?: Omit<
    React.ComponentProps<typeof Textarea>,
    'name' | 'id' | 'type' | keyof ControllerRenderProps
  >;
  isRequired?: boolean;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  className,
  name,
  label,
  labelProps,
  textareaProps,
  isRequired,
}) => {
  const { field, fieldState } = useController<{ __name__: string }, '__name__'>(
    { name: name as '__name__' },
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
      <Textarea
        {...textareaProps}
        {...field}
        value={field.value ?? ''}
        id={name}
        aria-invalid={Boolean(fieldState.error)}
      />
      {fieldState.error && (
        <div className="text-red-primary text-sm mt-1">
          {fieldState.error.message}
        </div>
      )}
    </div>
  );
};
