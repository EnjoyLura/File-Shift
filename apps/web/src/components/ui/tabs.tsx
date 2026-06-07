'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue>({ value: '', onValueChange: () => {} });

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

function Tabs({
  defaultValue = '',
  value: controlledValue,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const value = controlledValue ?? internalValue;

  const handleChange = React.useCallback(
    (v: string) => {
      setInternalValue(v);
      onValueChange?.(v);
    },
    [onValueChange],
  );

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleChange }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'underline' | 'pills';
}

function TabsList({ className, variant = 'default', children, ...props }: TabsListProps) {
  const variantClasses = {
    default:
      'inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground gap-1',
    underline: 'flex items-center gap-4 border-b border-border',
    pills: 'flex items-center gap-2 flex-wrap',
  };

  return (
    <div className={cn(variantClasses[variant], className)} role="tablist" {...props}>
      {children}
    </div>
  );
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  variant?: 'default' | 'underline' | 'pills';
}

function TabsTrigger({
  className,
  value: triggerValue,
  variant = 'default',
  children,
  ...props
}: TabsTriggerProps) {
  const { value, onValueChange } = React.useContext(TabsContext);
  const isActive = value === triggerValue;

  const variantClasses = {
    default: cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all',
      isActive ? 'bg-background text-foreground shadow-sm' : 'hover:text-foreground',
    ),
    underline: cn(
      'relative pb-3 text-sm font-medium transition-colors',
      isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
    ),
    pills: cn(
      'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
      isActive
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
    ),
  };

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onValueChange(triggerValue)}
      className={cn(variantClasses[variant], className)}
      {...props}
    >
      {children}
      {variant === 'underline' && isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
      )}
    </button>
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

function TabsContent({ className, value: contentValue, children, ...props }: TabsContentProps) {
  const { value } = React.useContext(TabsContext);
  if (value !== contentValue) return null;

  return (
    <div role="tabpanel" className={cn('mt-4', className)} {...props}>
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
