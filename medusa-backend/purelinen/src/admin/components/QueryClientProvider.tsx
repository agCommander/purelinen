import * as React from 'react';
import {
  QueryClient,
  QueryClientProvider as TanstackQueryClientProvider,
} from '@tanstack/react-query';

const queryClient = new QueryClient();

export const QueryClientProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
    </TanstackQueryClientProvider>
  );
};

export const withQueryClient = <P extends unknown = {}>(
  Component: React.ComponentType<P>,
) => {
  return (props: P & JSX.IntrinsicAttributes) => (
    <QueryClientProvider>
      <Component {...props} />
    </QueryClientProvider>
  );
};
