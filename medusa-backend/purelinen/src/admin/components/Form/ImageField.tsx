import { Label, Button, clx } from '@medusajs/ui';
import { DropzoneProps, useDropzone } from 'react-dropzone';
import { useController, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { useAdminUploadImage } from '../../hooks/images';

export interface ImageFieldProps {
  className?: string;
  name: string;
  label?: string;
  dropzoneProps?: Omit<DropzoneProps, 'maxFiles'>;
  dropzoneRootClassName?: string;
  sizeRecommendation?: React.ReactNode;
  isRequired?: boolean;
}

export interface ImageFieldValue {
  id: string;
  url: string;
}

export const imageFieldSchema = (params?: z.RawCreateParams) =>
  z.object(
    {
      id: z.string(),
      url: z.string().url(),
    },
    params,
  );

export const ImageField: React.FC<ImageFieldProps> = ({
  className,
  name,
  label,
  dropzoneProps,
  dropzoneRootClassName,
  sizeRecommendation = '1200 x 1600 (3:4) recommended, up to 10MB each',
  isRequired,
}) => {
  const form = useFormContext();
  const { field, fieldState } = useController<{
    __name__: {
      id: string;
      url: string;
    };
  }>({ name: name as '__name__' });
  const uploadFileMutation = useAdminUploadImage({
    onSuccess: (data) => {
      field.onChange({
        id: data.files[0].id,
        url: data.files[0].url,
      });
    },
    onError(error) {
      form.setError(name, {
        message: error.message,
        type: 'upload_error',
      });
    },
  });

  const { getRootProps, getInputProps, open } = useDropzone({
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png'],
    },
    ...dropzoneProps,
    maxFiles: 1,
    onDropAccepted(files) {
      uploadFileMutation.mutate({
        files,
      });
    },
  });

  return (
    <div className={className}>
      {typeof label !== 'undefined' && (
        <Label htmlFor={name} className="block mb-1">
          {label}
          {isRequired ? <span className="text-red-primary">*</span> : ''}
        </Label>
      )}
      <div
        {...getRootProps({
          className: clx(
            'inter-base-regular text-grey-50 rounded-rounded border-grey-20 hover:border-violet-60 hover:text-grey-40 flex h-full w-full cursor-pointer select-none flex-col items-center justify-center border-2 border-dashed transition-colors',
            dropzoneRootClassName,
          ),
        })}
      >
        <input {...getInputProps()} id={name} />
        {field.value && typeof field.value !== 'string' ? (
          <img
            src={field.value.url}
            className="w-full h-full object-contain rounded-rounded"
          />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <p>
              <span>
                Drop your image here, or{' '}
                <span className="text-violet-60">click to browse</span>
              </span>
            </p>
            {sizeRecommendation}
          </div>
        )}
      </div>
      {field.value && typeof field.value !== 'string' && (
        <div className="mt-2 flex flex-row items-center justify-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              field.onChange(null);
            }}
          >
            Remove
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              open();
            }}
          >
            Replace
          </Button>
        </div>
      )}
      {fieldState.error && (
        <div className="text-red-primary text-sm mt-1">
          {fieldState.error.message}
        </div>
      )}
    </div>
  );
};
