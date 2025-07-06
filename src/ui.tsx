import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

interface Variable {
  id: string;
  name: string;
  description: string;
  resolvedType: string;
  collectionId: string;
  collectionName?: string;
}

function App() {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
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
          setEditingId(null);
          // 変数を再読み込み
          parent.postMessage({ pluginMessage: { type: 'LOAD_VARIABLES' } }, '*');
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

  const handleEdit = (variable: Variable) => {
    setEditingId(variable.id);
    setEditingValue(variable.description || '');
  };

  const handleSave = (variableId: string) => {
    parent.postMessage({
      pluginMessage: {
        type: 'UPDATE_DESCRIPTION',
        variableId,
        description: editingValue,
      }
    }, '*');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingValue('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">
        ローカル変数一覧
        {isDebugMode && (
          <span className="ml-2 text-sm font-normal text-orange-600">
            (デバッグモード)
          </span>
        )}
      </h1>
      
      {variables.length === 0 ? (
        <div className="text-gray-500">ローカル変数が見つかりません</div>
      ) : (
        <div className="space-y-2">
          {variables.map((variable) => (
            <div key={variable.id} className="border rounded p-3 bg-white shadow-sm">
              <div className="font-medium text-sm">{variable.name}</div>
              <div className="text-xs text-gray-500 mb-2">
                タイプ: {variable.resolvedType}
                {variable.collectionName && (
                  <span className="ml-2">• コレクション: {variable.collectionName}</span>
                )}
              </div>
              
              {editingId === variable.id ? (
                <div className="mt-2">
                  <textarea
                    className="w-full p-2 border rounded text-sm"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    placeholder="説明を入力..."
                    rows={3}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      onClick={() => handleSave(variable.id)}
                    >
                      保存
                    </button>
                    <button
                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                      onClick={handleCancel}
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <div className="text-sm text-gray-600">
                    {variable.description || <span className="italic">説明なし</span>}
                  </div>
                  <button
                    className="mt-2 px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                    onClick={() => handleEdit(variable)}
                  >
                    編集
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);