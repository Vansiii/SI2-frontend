import React, { createContext, useContext, useState } from 'react';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  children: React.ReactNode;
  defaultValue: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ children, defaultValue, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`
        inline-flex items-center justify-center
        rounded-lg bg-gray-100 p-1
        ${className}
      `}
      style={{
        backgroundColor: 'var(--tenant-primary-soft, rgba(37, 99, 235, 0.12))',
      }}
    >
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ children, value, className = '' }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={`
        inline-flex items-center justify-center
        px-4 py-2 text-sm font-medium
        rounded-md transition-all duration-200
        ${
          isActive
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }
        ${className}
      `}
      style={
        isActive
          ? {
              backgroundColor: 'var(--tenant-surface, #FFFFFF)',
              color: 'var(--tenant-primary, #2563EB)',
            }
          : {}
      }
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ children, value, className = '' }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  const { activeTab } = context;

  if (activeTab !== value) return null;

  return (
    <div
      className={`mt-4 animate-fadeIn ${className}`}
      style={{
        animation: 'fadeIn 0.2s ease-in-out',
      }}
    >
      {children}
    </div>
  );
};
