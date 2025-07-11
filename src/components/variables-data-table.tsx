import React, { useState, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Input } from './ui/input';
import { ArrowUpDown } from 'lucide-react';
import { EditableCell } from './editable-cell';
import { VariableValueCell } from './variable-value-cell';

interface Variable {
  id: string;
  name: string;
  description: string;
  resolvedType: string;
  collectionId: string;
  collectionName?: string;
  valueInfo?: {
    type: 'color' | 'reference' | 'number' | 'string' | 'boolean';
    value: any;
    hex?: string;
    referenceId?: string;
    resolvedHex?: string;
  };
}

interface VariablesDataTableProps {
  variables: Variable[];
  onUpdateDescription: (variableId: string, description: string) => void;
  description?: string;
  isDebugMode?: boolean;
}

export function VariablesDataTable({
  variables,
  onUpdateDescription,
  description,
  isDebugMode,
}: VariablesDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // 変数を名前順にソート
  const tableData = useMemo(() => {
    return [...variables].sort((a, b) => a.name.localeCompare(b.name));
  }, [variables]);

  const columns: ColumnDef<Variable>[] = useMemo(() => [
    {
      accessorKey: 'collectionName',
      header: ({ column }) => {
        return (
          <button
            className="flex items-center gap-1 hover:text-foreground text-xs"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            コレクション
            <ArrowUpDown className="h-3 w-3" />
          </button>
        );
      },
      cell: ({ row }) => (
        <div className="text-muted-foreground text-xs">{row.getValue('collectionName') || 'Unknown'}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <button
            className="flex items-center gap-1 hover:text-foreground text-xs"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            変数名
            <ArrowUpDown className="h-3 w-3" />
          </button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium text-xs">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'resolvedType',
      header: ({ column }) => {
        return (
          <button
            className="flex items-center gap-1 hover:text-foreground text-xs"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            タイプ
            <ArrowUpDown className="h-3 w-3" />
          </button>
        );
      },
      cell: ({ row }) => (
        <div className="text-muted-foreground text-xs">{row.getValue('resolvedType')}</div>
      ),
    },
    {
      accessorKey: 'value',
      header: () => <span className="text-xs">値</span>,
      cell: ({ row }) => (
        <VariableValueCell 
          valueInfo={row.original.valueInfo}
          resolvedType={row.original.resolvedType}
        />
      ),
    },
    {
      accessorKey: 'description',
      header: () => <span className="text-xs">説明</span>,
      cell: ({ row }) => (
        <EditableCell
          value={row.original.description || ''}
          variableId={row.original.id}
          onUpdate={onUpdateDescription}
        />
      ),
    },
  ], [onUpdateDescription]);

  // フィルタリングされたテーブルデータを取得
  const filteredTableData = useMemo(() => {
    const filterValue = columnFilters.find(f => f.id === 'name')?.value as string || '';
    if (!filterValue) return tableData;
    
    return tableData.filter((variable) => 
      variable.name.toLowerCase().includes(filterValue.toLowerCase())
    );
  }, [tableData, columnFilters]);
  
  const table = useReactTable({
    data: filteredTableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    getRowId: (row) => row.id,
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground text-xs">
            {description}
          </p>
          {isDebugMode && (
            <span className="text-xs font-medium text-orange-600">
              (デバッグモード)
            </span>
          )}
        </div>
        <Input
          placeholder="変数名で検索..."
          value={(columnFilters.find(f => f.id === 'name')?.value as string) ?? ''}
          onChange={(event) =>
            setColumnFilters(prev => {
              const otherFilters = prev.filter(f => f.id !== 'name');
              return event.target.value
                ? [...otherFilters, { id: 'name', value: event.target.value }]
                : otherFilters;
            })
          }
          className="max-w-[200px]"
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  変数が見つかりません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}