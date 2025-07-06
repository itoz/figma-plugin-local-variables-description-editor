import React from 'react';
import { cn } from '../lib/utils';

interface VariableValueCellProps {
  valueInfo?: {
    type: 'color' | 'reference' | 'number' | 'string' | 'boolean';
    value: any;
    hex?: string;
    referenceId?: string;
    resolvedHex?: string; // 参照先の色の値
  };
  resolvedType: string;
}

export function VariableValueCell({ valueInfo, resolvedType }: VariableValueCellProps) {
  if (!valueInfo || !valueInfo.value) {
    return <span className="text-muted-foreground text-sm">-</span>;
  }

  switch (valueInfo.type) {
    case 'color':
      return (
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded border border-input"
            style={{ backgroundColor: valueInfo.hex || '#000' }}
            title={valueInfo.hex}
          />
          <span className="text-sm font-mono">{valueInfo.hex}</span>
        </div>
      );
    
    case 'reference':
      return (
        <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-[#fefefe] border border-gray-200">
          {resolvedType === 'COLOR' && valueInfo.resolvedHex && (
            <div 
              className="w-4 h-4 rounded border border-input"
              style={{ backgroundColor: valueInfo.resolvedHex }}
              title={valueInfo.resolvedHex}
            />
          )}
          <span className="text-sm text-gray-700">
            {valueInfo.value}
          </span>
        </div>
      );
    
    case 'number':
      return (
        <span className="text-sm font-mono">
          {typeof valueInfo.value === 'number' ? valueInfo.value.toFixed(2).replace(/\.00$/, '') : valueInfo.value}
        </span>
      );
    
    case 'string':
      return (
        <span className="text-sm truncate max-w-[200px]" title={valueInfo.value}>
          "{valueInfo.value}"
        </span>
      );
    
    case 'boolean':
      return (
        <span className={cn(
          "text-sm font-medium",
          valueInfo.value ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
        )}>
          {valueInfo.value ? 'true' : 'false'}
        </span>
      );
    
    default:
      return <span className="text-sm text-muted-foreground">-</span>;
  }
}