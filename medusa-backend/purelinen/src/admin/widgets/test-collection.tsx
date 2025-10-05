import * as React from 'react';
import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { DetailWidgetProps, AdminCollection } from '@medusajs/framework/types';
import { Container, Heading, Text } from '@medusajs/ui';

const TestCollectionWidget: React.FC<DetailWidgetProps<AdminCollection>> = ({
  data,
}) => {
  if (!data) {
    return null;
  }

  return (
    <Container>
      <Heading level="h2">Collection Images Test</Heading>
      <Text className="text-sm text-gray-500">
        Collection: {data.title}
      </Text>
    </Container>
  );
};

export default TestCollectionWidget;

export const config = defineWidgetConfig({
  zone: 'product_collection.details.after',
});
