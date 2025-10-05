import * as React from 'react';
import {
  FormProvider,
  useForm,
  UseFormProps,
  DefaultValues,
  UseFormReturn,
} from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export type FormProps<T extends z.ZodType<any, any>> = UseFormProps<
  z.infer<T>
> & {
  schema: T;
  onSubmit: (
    values: z.infer<T>,
    form: UseFormReturn<z.infer<T>>,
  ) => void | Promise<void>;
  defaultValues?: DefaultValues<z.infer<T>>;
  children?: React.ReactNode;
  formProps?: Omit<React.ComponentProps<'form'>, 'onSubmit'>;
};

export const Form = <T extends z.ZodType<any, any>>({
  schema,
  onSubmit,
  children,
  formProps,
  ...props
}: FormProps<T>) => {
  const form = useForm({
    resolver: zodResolver(schema),
    ...props,
  });

  const submitHandler = React.useCallback(
    (values: z.infer<T>) => {
      return onSubmit(values, form);
    },
    [onSubmit, form],
  );

  const onFormSubmit: React.FormEventHandler<HTMLFormElement> =
    React.useCallback(
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit(submitHandler)(event);
      },
      [form, submitHandler],
    );

  return (
    <FormProvider {...form}>
      <form {...formProps} onSubmit={onFormSubmit}>
        <fieldset disabled={form.formState.isSubmitting}>{children}</fieldset>
      </form>
    </FormProvider>
  );
};
