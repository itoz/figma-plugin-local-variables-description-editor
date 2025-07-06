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
    return <span className="text-muted-foreground text-xs">-</span>;
  }

  switch (valueInfo.type) {
    case 'color':
      return (
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded border border-input"
            style={{ backgroundColor: valueInfo.hex || '#000' }}
            title={valueInfo.hex}
          />
          <span className="text-xs font-mono">{valueInfo.hex}</span>
        </div>
      );
    
    case 'reference':
      return (
        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#fefefe] border border-gray-200">
          {resolvedType === 'COLOR' && valueInfo.resolvedHex && (
            <div 
              className="w-3 h-3 rounded border border-input"
              style={{ backgroundColor: valueInfo.resolvedHex }}
              title={valueInfo.resolvedHex}
            />
          )}
          <span className="text-xs text-gray-700">
            {valueInfo.value}
          </span>
          {resolvedType === 'COLOR' && valueInfo.resolvedHex && (
            <span className="text-xs font-mono text-gray-500">
              {valueInfo.resolvedHex}
            </span>
          )}
        </div>
      );
    
    case 'number':
      return (
        <span className="text-xs font-mono">
          {typeof valueInfo.value === 'number' ? valueInfo.value.toFixed(2).replace(/\.00$/, '') : valueInfo.value}
        </span>
      );
    
    case 'string':
      return (
        <span className="text-xs truncate max-w-[150px]" title={valueInfo.value}>
          "{valueInfo.value}"
        </span>
      );
    
    case 'boolean':
      return (
        <span className={cn(
          "text-xs font-medium",
          valueInfo.value ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
        )}>
          {valueInfo.value ? 'true' : 'false'}
        </span>
      );
    
    default:
      return <span className="text-xs text-muted-foreground">-</span>;
  }
}