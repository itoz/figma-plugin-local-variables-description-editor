import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import { VariablesDataTable } from './components/variables-data-table';

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

function App() {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDebugMode, setIsDebugMode] = useState(false);

  useEffect(() => {
    // プラグインからのメッセージを受信
    window.onmessage = (event) => {
      const msg = event.data.pluginMessage;
      if (!msg) return;

      switch (msg.type) {
        case 'VARIABLES_LOADED':
          setVariables(msg.variables);
          setIsDebugMode(msg.isDebugMode || false);
          setLoading(false);
          break;
        case 'UPDATE_SUCCESS':
          // 更新成功時、該当する変数の値を更新
          const updatedVariableId = msg.variableId;
          if (updatedVariableId) {
            setVariables(prev => prev.map(v => 
              v.id === updatedVariableId 
                ? { ...v, description: msg.description || v.description }
                : v
            ));
          }
          console.log('Description updated successfully');
          break;
        case 'ERROR':
          console.error(msg.message);
          setLoading(false);
          break;
      }
    };

    // プラグインコードにメッセージを送信して変数を読み込む
    parent.postMessage({ pluginMessage: { type: 'LOAD_VARIABLES' } }, '*');
  }, []);

  const handleUpdateDescription = (variableId: string, description: string) => {
    parent.postMessage({
      pluginMessage: {
        type: 'UPDATE_DESCRIPTION',
        variableId,
        description,
      }
    }, '*');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {variables.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-xs">
          ローカル変数が見つかりません
        </div>
      ) : (
        <VariablesDataTable
          variables={variables}
          onUpdateDescription={handleUpdateDescription}
          description="変数の説明を直接編集できます"
          isDebugMode={isDebugMode}
        />
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);