import * as React from 'react';

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLabel: string;
  setSelectedLabel: React.Dispatch<React.SetStateAction<string>>;
} | null>(null);

export function Select({ value, onValueChange, children }: any) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState('');
  
  // Close on outside click
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, selectedLabel, setSelectedLabel }}>
      <div ref={containerRef} className="relative w-full">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className = '', children, ...props }: any) {
  const context = React.useContext(SelectContext);
  if (!context) return null;
  return (
    <button
      type="button"
      onClick={() => context.setIsOpen(!context.isOpen)}
      className={`flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-black text-left cursor-pointer ${className}`}
      {...props}
    >
      {children}
      <span className="ml-2 text-gray-500">▼</span>
    </button>
  );
}

export function SelectValue({ placeholder }: any) {
  const context = React.useContext(SelectContext);
  if (!context) return null;
  return <span>{context.selectedLabel || placeholder}</span>;
}

export function SelectContent({ className = '', children, ...props }: any) {
  const context = React.useContext(SelectContext);
  if (!context) return null;
  if (!context.isOpen) return null;
  return (
    <div
      className={`absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white p-1 text-sm shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function SelectItem({ value, className = '', children, ...props }: any) {
  const context = React.useContext(SelectContext);
  if (!context) return null;
  const isSelected = context.value === value;

  React.useEffect(() => {
    if (isSelected) {
      context.setSelectedLabel(children);
    }
  }, [isSelected, children]);

  const handleSelect = () => {
    if (context.onValueChange) {
      context.onValueChange(value);
    }
    context.setSelectedLabel(children);
    context.setIsOpen(false);
  };

  return (
    <div
      onClick={handleSelect}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 px-3 text-sm outline-none hover:bg-gray-100 ${
        isSelected ? 'bg-gray-50 font-medium text-black' : 'text-gray-900'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
