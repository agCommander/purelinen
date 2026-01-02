import { Label, clx } from '@medusajs/ui';
import { useController } from 'react-hook-form';

export interface SelectFieldProps {
  className?: string;
  name: string;
  label?: string;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  isRequired?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  className,
  name,
  label,
  options,
  placeholder,
  isRequired,
}) => {
  const { field, fieldState } = useController<{ __name__: string }, '__name__'>(
    { name: name as '__name__' }
  );

  return (
    <div className={className}>
      {typeof label !== 'undefined' && (
        <Label
          htmlFor={name}
          className={clx('block mb-1')}
        >
          {label}
          {isRequired ? <span className="text-red-primary">*</span> : ''}
        </Label>
      )}
      <select
        {...field}
        id={name}
        value={field.value ?? ''}
        onChange={(e) => field.onChange(e.target.value || null)}
        className={clx(
          'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-60',
          fieldState.error && 'border-red-primary'
        )}
        aria-invalid={Boolean(fieldState.error)}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {fieldState.error && (
        <div className="text-red-primary text-sm mt-1">
          {fieldState.error.message}
        </div>
      )}
    </div>
  );
};

