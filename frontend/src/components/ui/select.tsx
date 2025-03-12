// src/components/ui/select.tsx

import React, { ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  value: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  children: ReactNode;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  placeholder,
  children,
  className,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className={cn(
        "w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
        className
      )}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {children}
    </select>
  );
};

// SelectItem is just a plain option element
const SelectItem: React.FC<React.OptionHTMLAttributes<HTMLOptionElement>> = ({
  children,
  ...props
}) => {
  return <option {...props}>{children}</option>;
};

// SelectValue is not needed with this implementation
const SelectValue: React.FC<{ placeholder?: string }> = () => null;

// SelectTrigger is not needed with this implementation
const SelectTrigger: React.FC<{ id?: string; children?: ReactNode; className?: string }> = ({ children }) => <>{children}</>;

// SelectContent is not needed with this implementation
const SelectContent: React.FC<{ children?: ReactNode }> = ({ children }) => <>{children}</>;

export { Select, SelectItem, SelectTrigger, SelectValue, SelectContent };