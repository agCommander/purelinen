"use client"

import * as React from 'react';
import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Container, Text } from '@medusajs/ui';
import { ArrowLeft } from '@medusajs/icons';

/**
 * Customer Detail Back Link Widget
 * Adds a link to navigate back to the custom customer list
 * Injects into the customer detail page
 */
const CustomerDetailBackLinkWidget = ({ data }: any) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract customer ID from the route or data
  const customerId = data?.customer?.id || location.pathname.split('/').pop();
  
  // Only show if we're on a customer detail page
  if (!customerId || !location.pathname.includes('/customers/')) {
    return null;
  }

  return (
    <Container className="mt-4">
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex-1">
          <Text className="text-sm text-gray-600">
            Viewing customer details. Use the enhanced customer list to see all customers with group types and approval status.
          </Text>
        </div>
        <Button
          variant="secondary"
          size="small"
          onClick={() => navigate('/customers-list')}
        >
          <ArrowLeft className="mr-1" />
          Back to Customers List
        </Button>
      </div>
    </Container>
  );
};

// Try different zones - customer detail pages might use different zone names
export const config = defineWidgetConfig({
  zone: 'customer.details.before', // Place at top of page
  // zone: 'customer.details.after', // Alternative - bottom of page
  // zone: 'customers.details.before', // With 's'
});

export default CustomerDetailBackLinkWidget;
