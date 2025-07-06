// Figmaプラグインのメインコード
figma.showUI(__html__, {
  width: 900,  // 値カラムも含めて快適に表示するため幅を拡大
  height: 600,
});

// プラグイン起動時に自動的に変数を読み込む
setTimeout(() => {
  loadLocalVariables();
}, 100);

// RGB値を16進数に変換
function rgbToHex(color: any): string {
  const toHex = (value: number) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  if (color && typeof color === 'object' && 'r' in color && 'g' in color && 'b' in color) {
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
  }
  return '#000000';
}

// ローカル変数を取得してUIに送信
async function loadLocalVariables() {
  try {
    console.log('Loading local variables...');
    
    // すべてのローカル変数を取得
    const localVariables = await figma.variables.getLocalVariablesAsync();
    console.log('Found variables:', localVariables.length);
    
    // コレクション情報も取得
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const collectionMap = new Map(collections.map(c => [c.id, c]));
    
    // 変数の情報を整形
    const variablesData = await Promise.all(localVariables.map(async (variable) => {
      const collection = collectionMap.get(variable.variableCollectionId);
      
      // 変数の値を取得
      let valueInfo: any = {};
      try {
        // デフォルトモードの値を取得
        const modeId = collection?.defaultModeId || collection?.modes[0]?.modeId;
        if (modeId) {
          const value = variable.valuesByMode[modeId];
          
          // 解決済みの値も取得（参照を自動的に解決）
          let resolvedValue = null;
          try {
            if (variable.resolvedType === 'COLOR') {
              // 最初のフレームノードを取得（PageNode の子要素は SceneNode）
              const firstPage = figma.root.children[0];
              if (firstPage && firstPage.type === 'PAGE' && firstPage.children.length > 0) {
                const firstFrame = firstPage.children[0];
                const resolved = await variable.resolveForConsumer(firstFrame);
                resolvedValue = resolved.value;
              }
            }
          } catch (e) {
            console.log('Could not resolve value:', e);
          }
          
          if (value) {
            if (typeof value === 'object' && 'type' in value) {
              // 参照値の場合
              if (value.type === 'VARIABLE_ALIAS') {
                const referencedVar = await figma.variables.getVariableByIdAsync(value.id);
                let resolvedHex = undefined;
                
                // 参照先が色の場合
                if (referencedVar && referencedVar.resolvedType === 'COLOR') {
                  console.log('Referenced variable is COLOR:', referencedVar.name);
                  // 解決済みの値を使用
                  if (resolvedValue) {
                    resolvedHex = rgbToHex(resolvedValue);
                    console.log('Using resolved value:', resolvedHex);
                  } else {
                    // 参照先の変数の値を直接取得
                    try {
                      const refModeId = collection?.defaultModeId || collection?.modes[0]?.modeId;
                      if (refModeId && referencedVar.valuesByMode[refModeId]) {
                        const refValue = referencedVar.valuesByMode[refModeId];
                        if (typeof refValue === 'object' && 'r' in refValue && 'g' in refValue && 'b' in refValue) {
                          resolvedHex = rgbToHex(refValue);
                          console.log('Using direct value:', resolvedHex);
                        }
                      }
                    } catch (e) {
                      console.log('Could not get referenced color value:', e);
                    }
                  }
                }
                
                valueInfo = {
                  type: 'reference',
                  value: referencedVar?.name || 'Unknown',
                  referenceId: value.id,
                  resolvedHex: resolvedHex,
                };
              }
            } else if (variable.resolvedType === 'COLOR' && typeof value === 'object') {
              // 色の値の場合
              valueInfo = {
                type: 'color',
                value: value,
                hex: rgbToHex(value),
              };
            } else if (variable.resolvedType === 'FLOAT') {
              // 数値の場合
              valueInfo = {
                type: 'number',
                value: value,
              };
            } else if (variable.resolvedType === 'STRING') {
              // 文字列の場合
              valueInfo = {
                type: 'string',
                value: value,
              };
            } else if (variable.resolvedType === 'BOOLEAN') {
              // ブール値の場合
              valueInfo = {
                type: 'boolean',
                value: value,
              };
            }
          }
        }
      } catch (error) {
        console.error('Error getting variable value:', error);
      }
      
      return {
        id: variable.id,
        name: variable.name,
        description: variable.description || '',
        resolvedType: variable.resolvedType,
        collectionId: variable.variableCollectionId,
        collectionName: collection?.name || 'Unknown',
        valueInfo: valueInfo,
      };
    }));
    
    console.log('Processed variables:', variablesData.length);

    // デバッグ用：変数がない場合はサンプルデータを表示
    if (variablesData.length === 0) {
      console.log('No variables found. Showing sample data for UI testing.');
      const sampleData = [
        {
          id: 'sample-1',
          name: 'color/primary',
          description: 'プライマリカラー',
          resolvedType: 'COLOR',
          collectionId: 'collection-1',
          collectionName: 'Sample Collection',
          valueInfo: {
            type: 'color',
            value: { r: 0.2, g: 0.5, b: 1 },
            hex: '#3380ff',
          },
        },
        {
          id: 'sample-2',
          name: 'color/secondary',
          description: 'セカンダリカラー',
          resolvedType: 'COLOR',
          collectionId: 'collection-1',
          collectionName: 'Sample Collection',
          valueInfo: {
            type: 'reference',
            value: 'color/primary',
            referenceId: 'sample-1',
            resolvedHex: '#3380ff',
          },
        },
        {
          id: 'sample-3',
          name: 'spacing/small',
          description: '小さい余白',
          resolvedType: 'FLOAT',
          collectionId: 'collection-1',
          collectionName: 'Sample Collection',
          valueInfo: {
            type: 'number',
            value: 8,
          },
        },
        {
          id: 'sample-4',
          name: 'text/heading',
          description: '',
          resolvedType: 'STRING',
          collectionId: 'collection-1',
          collectionName: 'Sample Collection',
          valueInfo: {
            type: 'string',
            value: 'Heading Text',
          },
        },
      ];
      
      figma.ui.postMessage({
        type: 'VARIABLES_LOADED',
        variables: sampleData,
        isDebugMode: true,
      });
      return;
    }

    // UIに変数データを送信
    figma.ui.postMessage({
      type: 'VARIABLES_LOADED',
      variables: variablesData,
    });
  } catch (error) {
    console.error('Error loading variables:', error);
    figma.ui.postMessage({
      type: 'ERROR',
      message: 'Failed to load variables',
    });
  }
}

// UIからのメッセージを処理
figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case 'LOAD_VARIABLES':
      await loadLocalVariables();
      break;
      
    case 'UPDATE_DESCRIPTION':
      try {
        // サンプルデータの場合は更新をスキップ
        if (msg.variableId.startsWith('sample-')) {
          console.log('Debug mode: Skipping update for sample variable');
          figma.ui.postMessage({
            type: 'UPDATE_SUCCESS',
            variableId: msg.variableId,
          });
          return;
        }
        
        const variable = await figma.variables.getVariableByIdAsync(msg.variableId);
        if (variable) {
          variable.description = msg.description;
          figma.ui.postMessage({
            type: 'UPDATE_SUCCESS',
            variableId: msg.variableId,
            description: msg.description,
          });
        }
      } catch (error) {
        console.error('Error updating description:', error);
        figma.ui.postMessage({
          type: 'ERROR',
          message: 'Failed to update description',
        });
      }
      break;
      
    case 'CLOSE_PLUGIN':
      figma.closePlugin();
      break;
  }
};