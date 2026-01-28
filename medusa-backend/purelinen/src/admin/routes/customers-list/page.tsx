import * as React from 'react';
import { defineRouteConfig } from '@medusajs/admin-sdk';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Heading,
  Button,
  Table,
  Text,
  Badge,
} from '@medusajs/ui';
import { Users, ArrowRight } from '@medusajs/icons';
import { withQueryClient } from '../../components/QueryClientProvider';

type CustomerWithGroups = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  company_name: string | null;
  created_at: string;
  group_type: string | null;
  groups: any[];
  approved: boolean;
  abn_acn: string | null;
  business_description: string | null;
  website: string | null;
};

const CustomersListPage = () => {
  const navigate = useNavigate();

  // Fetch all customers with groups
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['customers-with-groups'],
    queryFn: async () => {
      const response = await fetch('/admin/customers/list-with-groups', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const result = await response.json();
      return result.customers || [];
    },
  });

  const customers: CustomerWithGroups[] = data || [];

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center py-12">
          <Text>Loading customers...</Text>
        </div>
      </Container>
    );
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Heading level="h1">Customers</Heading>
          <Badge color="grey" size="2xsmall">
            {customers.length} total
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
            <Users className="mx-auto mb-4 text-gray-400" />
            <Text className="text-gray-500">No customers found</Text>
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
                <Table.HeaderCell>Group</Table.HeaderCell>
                <Table.HeaderCell>Approved</Table.HeaderCell>
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
                    {customer.group_type ? (
                      <Badge 
                        color={customer.group_type === 'B2B' ? 'blue' : 'green'} 
                        size="2xsmall"
                      >
                        {customer.group_type}
                      </Badge>
                    ) : (
                      <Text className="text-gray-400 text-sm">-</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {customer.group_type === 'B2B' ? (
                      customer.approved ? (
                        <Badge color="green" size="2xsmall">
                          Approved
                        </Badge>
                      ) : (
                        <Badge color="orange" size="2xsmall">
                          Pending
                        </Badge>
                      )
                    ) : (
                      <Text className="text-gray-400 text-sm">-</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Text className="text-sm text-gray-500">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end">
                      <Button
                        variant="transparent"
                        size="small"
                        onClick={() => navigate(`/customers/${customer.id}`)}
                      >
                        View
                        <ArrowRight className="ml-1" />
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
  label: 'Customers',
  icon: Users,
  // Try to override the default customers route
  // Note: This might not work if Medusa doesn't allow route overriding
});

export default withQueryClient(CustomersListPage);
