import { HttpTypes } from '@medusajs/framework/types';
import { UseMutationOptions, useMutation } from '@tanstack/react-query';

const getFileBase64EncodedContent = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(
        (reader.result as string).replace('data:', '').replace(/^.+,/, ''),
      );
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const createPayload = async (payload: HttpTypes.AdminUploadFile) => {
  if (payload instanceof FileList) {
    const formData = new FormData();
    for (const file of payload) {
      formData.append('files', file);
    }
    return formData;
  }

  if (payload.files.every((f) => f instanceof File)) {
    const formData = new FormData();
    for (const file of payload.files) {
      formData.append('files', file);
    }
    return formData;
  }

  const obj: {
    files: {
      name: string;
      content: string;
    }[];
  } = {
    files: [],
  };

  for (const file of payload.files) {
    if (file instanceof File) {
      obj.files.push({
        name: file.name,
        content: await getFileBase64EncodedContent(file),
      });
    } else {
      obj.files.push(file);
    }
  }

  return JSON.stringify(obj);
};

export const useAdminUploadImage = (
  options?: UseMutationOptions<
    HttpTypes.AdminFileListResponse,
    Error,
    HttpTypes.AdminUploadFile
  >,
) => {
  return useMutation<
    HttpTypes.AdminFileListResponse,
    Error,
    HttpTypes.AdminUploadFile
  >({
    mutationKey: ['admin-upload-image'],
    mutationFn: async (payload) => {
      const res = await fetch(`/admin/uploads`, {
        method: 'POST',
        body: await createPayload(payload),
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(res.statusText);
      }

      return res.json();
    },
    ...options,
  });
};
