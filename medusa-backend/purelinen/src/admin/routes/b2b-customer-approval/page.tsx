import * as React from 'react';
import { defineRouteConfig } from '@medusajs/admin-sdk';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Heading,
  Button,
  toast,
  Table,
  Text,
  Badge,
} from '@medusajs/ui';
import { CheckCircle, XCircle, Clock } from '@medusajs/icons';
import { withQueryClient } from '../../components/QueryClientProvider';

type PendingCustomer = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  company_name: string | null;
  created_at: string;
  abn_acn: string | null;
  business_description: string | null;
  website: string | null;
  approved: boolean;
  registration_step: number | null;
};

const B2BCustomerApprovalPage = () => {
  const queryClient = useQueryClient();

  // Fetch pending customers
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['pending-approval-customers'],
    queryFn: async () => {
      const response = await fetch('/admin/customers/pending-approval', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch pending customers');
      }
      const result = await response.json();
      return result.customers || [];
    },
  });

  // Approve customer mutation
  const approveMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const response = await fetch(`/admin/customers/${customerId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ approved: true }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to approve customer');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approval-customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer approved successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to approve customer: ${error.message}`);
    },
  });

  // Reject customer mutation
  const rejectMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const response = await fetch(`/admin/customers/${customerId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ approved: false }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reject customer');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approval-customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer rejected');
    },
    onError: (error: any) => {
      toast.error(`Failed to reject customer: ${error.message}`);
    },
  });

  const customers: PendingCustomer[] = data || [];

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center py-12">
          <Text>Loading pending customers...</Text>
        </div>
      </Container>
    );
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Heading level="h1">B2B Customer Approvals</Heading>
          <Badge color="orange" size="2xsmall">
            {customers.length} pending
          </Badge>
        </div>
        <Button
          variant="secondary"
          size="small"
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </div>

      {customers.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Clock className="mx-auto mb-4 text-gray-400" />
            <Text className="text-gray-500">No customers pending approval</Text>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Email</Table.HeaderCell>
                <Table.HeaderCell>Phone</Table.HeaderCell>
                <Table.HeaderCell>Company</Table.HeaderCell>
                <Table.HeaderCell>Website</Table.HeaderCell>
                <Table.HeaderCell>ABN/ACN</Table.HeaderCell>
                <Table.HeaderCell>Business Description</Table.HeaderCell>
                <Table.HeaderCell>Registered</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {customers.map((customer) => (
                <Table.Row key={customer.id}>
                  <Table.Cell>
                    <Text>
                      {customer.first_name || ''} {customer.last_name || ''}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text>{customer.email}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text>{customer.phone || '-'}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text>{customer.company_name || '-'}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    {customer.website ? (
                      <a 
                        href={customer.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {customer.website}
                      </a>
                    ) : (
                      <Text>-</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Text className="font-mono text-sm">
                      {customer.abn_acn || '-'}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    {customer.business_description ? (
                      <Text 
                        className="max-w-xs truncate" 
                        title={customer.business_description}
                      >
                        {customer.business_description}
                      </Text>
                    ) : (
                      <Text>-</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Text className="text-sm text-gray-500">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => approveMutation.mutate(customer.id)}
                        disabled={
                          approveMutation.isPending ||
                          rejectMutation.isPending
                        }
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => rejectMutation.mutate(customer.id)}
                        disabled={
                          approveMutation.isPending ||
                          rejectMutation.isPending
                        }
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <XCircle className="mr-1" />
                        Reject
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}
    </Container>
  );
};

export const config = defineRouteConfig({
  label: 'B2B Customer Approvals',
  icon: Clock,
});

export default withQueryClient(B2BCustomerApprovalPage);
