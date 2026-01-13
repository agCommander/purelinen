import * as React from 'react';
import { defineRouteConfig } from '@medusajs/admin-sdk';
import {
  PencilSquare,
  EllipsisHorizontal,
  Trash,
  ArrowPath,
} from '@medusajs/icons';
import {
  Container,
  Heading,
  Table,
  Button,
  IconButton,
  Text,
  Drawer,
  DropdownMenu,
  Prompt,
  Switch,
  Label,
} from '@medusajs/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { Form } from '../../components/Form/Form';
import { InputField } from '../../components/Form/InputField';
import { withQueryClient } from '../../components/QueryClientProvider';
import { z } from 'zod';

type Color = {
  id: string;
  name: string;
  hex_code: string;
  filter_group: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

const colorFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  hex_code: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Hex code must be in format #RRGGBB"),
  filter_group: z.string().transform(val => val === '' ? null : val).optional().nullable(),
});

type ColorFormData = z.infer<typeof colorFormSchema>;

const DeleteColorPrompt: React.FC<{
  id: string;
  name: string;
  children: React.ReactNode;
}> = ({ id, name, children }) => {
  const queryClient = useQueryClient();
  const [isPromptOpen, setIsPromptOpen] = React.useState(false);
  const deleteColorMutation = useMutation({
    mutationKey: ['colors', id, 'delete'],
    mutationFn: async () => {
      return fetch(`/admin/custom/colors/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      }).then((res) => res.json());
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'colors',
      });
      setIsPromptOpen(false);
    },
  });

  return (
    <Prompt open={isPromptOpen} onOpenChange={setIsPromptOpen}>
      <Prompt.Trigger asChild>{children}</Prompt.Trigger>
      <Prompt.Content>
        <Prompt.Header>
          <Prompt.Title>Delete {name} color?</Prompt.Title>
          <Prompt.Description>
            Are you sure you want to delete the color {name}?
          </Prompt.Description>
        </Prompt.Header>
        <Prompt.Footer>
          <Prompt.Cancel>Cancel</Prompt.Cancel>
          <Prompt.Action
            onClick={() => {
              deleteColorMutation.mutate();
            }}
          >
            Delete
          </Prompt.Action>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  );
};

const RestoreColorPrompt: React.FC<{
  id: string;
  name: string;
  children: React.ReactNode;
}> = ({ id, name, children }) => {
  const queryClient = useQueryClient();
  const [isPromptOpen, setIsPromptOpen] = React.useState(false);
  const restoreColorMutation = useMutation({
    mutationKey: ['colors', id, 'restore'],
    mutationFn: async () => {
      return fetch(`/admin/custom/colors/${id}/restore`, {
        method: 'POST',
        credentials: 'include',
      }).then((res) => res.json());
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'colors',
      });
      setIsPromptOpen(false);
    },
  });

  return (
    <Prompt open={isPromptOpen} onOpenChange={setIsPromptOpen}>
      <Prompt.Trigger asChild>{children}</Prompt.Trigger>
      <Prompt.Content>
        <Prompt.Header>
          <Prompt.Title>Restore {name} color?</Prompt.Title>
          <Prompt.Description>
            Are you sure you want to restore the color {name}?
          </Prompt.Description>
        </Prompt.Header>
        <Prompt.Footer>
          <Prompt.Cancel>Cancel</Prompt.Cancel>
          <Prompt.Action
            onClick={() => {
              restoreColorMutation.mutate();
            }}
          >
            Restore
          </Prompt.Action>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  );
};

const EditColorDrawer: React.FC<{
  id?: string;
  initialValues?: Partial<ColorFormData>;
  children: React.ReactNode;
}> = ({ id, initialValues, children }) => {
  const queryClient = useQueryClient();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const updateColorMutation = useMutation({
    mutationKey: ['colors', id, 'update'],
    mutationFn: async (values: ColorFormData) => {
      return fetch(`/admin/custom/colors/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(values),
      }).then((res) => res.json());
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'colors',
      });
      setIsDrawerOpen(false);
    },
  });

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <Drawer.Trigger asChild>{children}</Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Edit Color</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <Form
            schema={colorFormSchema}
            defaultValues={initialValues}
            onSubmit={async (values) => {
              await updateColorMutation.mutateAsync(values);
            }}
            formProps={{
              id: `edit-color-form-${id}`,
            }}
          >
            <div className="flex flex-col gap-4">
              <InputField name="name" label="Name" isRequired />
              <InputField 
                name="hex_code" 
                label="Hex Code" 
                isRequired 
                inputProps={{ placeholder: "#RRGGBB" }}
              />
              <InputField 
                name="filter_group" 
                label="Filter Group" 
                inputProps={{ placeholder: "e.g., Shades of Blue" }}
              />
            </div>
          </Form>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button variant="secondary">Cancel</Button>
          </Drawer.Close>
          <Button
            type="submit"
            form={`edit-color-form-${id}`}
            isLoading={updateColorMutation.isPending}
          >
            Save
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};

const ColorsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const deleted = searchParams.has('deleted');
  const toggleDeleted = React.useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!prev.has('deleted')) {
        next.set('deleted', '');
      } else {
        next.delete('deleted');
      }
      return next;
    });
  }, [setSearchParams]);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ['colors', deleted],
    queryFn: async () => {
      return fetch(
        `/admin/custom/colors${deleted ? '?deleted=true' : ''}`,
        {
          credentials: 'include',
        }
      ).then(
        (res) =>
          res.json() as Promise<{
            colors: Color[];
            count: number;
          }>
      );
    },
  });

  const createColorMutation = useMutation({
    mutationKey: ['colors', 'create'],
    mutationFn: async (values: ColorFormData) => {
      return fetch('/admin/custom/colors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(values),
      }).then((res) => res.json());
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'colors',
      });
      setIsCreateModalOpen(false);
    },
  });

  return (
    <Container className="px-0">
      <div className="px-6 flex flex-row gap-6 justify-between items-center mb-4">
        <Heading level="h2">Colors</Heading>
        <div className="flex flex-row gap-4">
          <div className="flex items-center gap-x-2">
            <Switch
              id="deleted-flag"
              checked={deleted}
              onClick={() => {
                toggleDeleted();
              }}
            />
            <Label htmlFor="deleted-flag">Show Deleted</Label>
          </div>
          <Drawer open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <Drawer.Trigger asChild>
              <Button variant="secondary" size="small">
                Create
              </Button>
            </Drawer.Trigger>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>Create Color</Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                <Form
                  schema={colorFormSchema}
                  onSubmit={async (values) => {
                    await createColorMutation.mutateAsync(values);
                  }}
                  formProps={{
                    id: 'create-color-form',
                  }}
                >
                  <div className="flex flex-col gap-4">
                    <InputField name="name" label="Name" isRequired />
                    <InputField 
                      name="hex_code" 
                      label="Hex Code" 
                      isRequired 
                      inputProps={{ placeholder: "#RRGGBB" }}
                    />
                    <InputField 
                      name="filter_group" 
                      label="Filter Group" 
                      inputProps={{ placeholder: "e.g., Shades of Blue" }}
                    />
                  </div>
                </Form>
              </Drawer.Body>
              <Drawer.Footer>
                <Drawer.Close asChild>
                  <Button variant="secondary">Cancel</Button>
                </Drawer.Close>
                <Button
                  type="submit"
                  form="create-color-form"
                  isLoading={createColorMutation.isPending}
                >
                  Create
                </Button>
              </Drawer.Footer>
            </Drawer.Content>
          </Drawer>
        </div>
      </div>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Hex Code</Table.HeaderCell>
            <Table.HeaderCell>Filter Group</Table.HeaderCell>
            <Table.HeaderCell>&nbsp;</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {isLoading && (
            <Table.Row>
              {/* @ts-ignore */}
              <Table.Cell colSpan={4}>
                <Text>Loading...</Text>
              </Table.Cell>
            </Table.Row>
          )}
          {isError && (
            <Table.Row>
              {/* @ts-ignore */}
              <Table.Cell colSpan={4}>
                <Text>Error loading colors</Text>
              </Table.Cell>
            </Table.Row>
          )}
          {isSuccess && data.colors.length === 0 && (
            <Table.Row>
              {/* @ts-ignore */}
              <Table.Cell colSpan={4}>
                <Text>No colors found</Text>
              </Table.Cell>
            </Table.Row>
          )}
          {isSuccess &&
            data.colors.length > 0 &&
            data.colors.map((color) => (
              <Table.Row key={color.id}>
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    {color.hex_code && (
                      <div
                        className="w-6 h-6 rounded border border-grayscale-300"
                        style={{ backgroundColor: color.hex_code }}
                      />
                    )}
                    <span>{color.name}</span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <code className="text-sm">{color.hex_code || '-'}</code>
                </Table.Cell>
                <Table.Cell>
                  {color.filter_group || '-'}
                </Table.Cell>
                <Table.Cell className="text-right">
                  <DropdownMenu>
                    <DropdownMenu.Trigger asChild>
                      <IconButton>
                        <EllipsisHorizontal />
                      </IconButton>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item asChild>
                        <EditColorDrawer
                          id={color.id}
                          initialValues={{
                            name: color.name,
                            hex_code: color.hex_code,
                            filter_group: color.filter_group || null,
                          }}
                        >
                          <Button
                            variant="transparent"
                            className="flex flex-row gap-2 items-center w-full justify-start"
                          >
                            <PencilSquare className="text-fg-subtle dark:text-fg-subtle-dark" />
                            Edit
                          </Button>
                        </EditColorDrawer>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      {color.deleted_at ? (
                        <DropdownMenu.Item asChild>
                          <RestoreColorPrompt
                            id={color.id}
                            name={color.name}
                          >
                            <Button
                              variant="transparent"
                              className="flex flex-row gap-2 items-center w-full justify-start"
                            >
                              <ArrowPath className="text-fg-subtle dark:text-fg-subtle-dark" />
                              Restore
                            </Button>
                          </RestoreColorPrompt>
                        </DropdownMenu.Item>
                      ) : (
                        <DropdownMenu.Item asChild>
                          <DeleteColorPrompt
                            id={color.id}
                            name={color.name}
                          >
                            <Button
                              variant="transparent"
                              className="flex flex-row gap-2 items-center w-full justify-start"
                            >
                              <Trash className="text-fg-subtle dark:text-fg-subtle-dark" />
                              Delete
                            </Button>
                          </DeleteColorPrompt>
                        </DropdownMenu.Item>
                      )}
                    </DropdownMenu.Content>
                  </DropdownMenu>
                </Table.Cell>
              </Table.Row>
            ))}
        </Table.Body>
      </Table>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: 'Colors',
});

export default withQueryClient(ColorsPage);
