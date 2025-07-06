import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';

interface EditableCellProps {
  value: string;
  variableId: string;
  onUpdate: (variableId: string, value: string) => void;
}

export function EditableCell({ value, variableId, onUpdate }: EditableCellProps) {
  const [editValue, setEditValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const [lastSavedValue, setLastSavedValue] = useState(value);

  // propsのvalueが変更されたときのみ更新（ただし自分が保存した値でない場合）
  useEffect(() => {
    if (!isEditing && value !== lastSavedValue) {
      setEditValue(value);
      setLastSavedValue(value);
    }
  }, [value, isEditing, lastSavedValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onUpdate(variableId, editValue);
      setLastSavedValue(editValue);
    }
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <Input
      value={editValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      placeholder="説明を入力..."
      className="w-full max-w-none text-xs h-7 px-2 py-0.5"
      autoComplete="off"
      spellCheck={false}
    />
  );
}