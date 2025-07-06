// Figmaプラグインのメインコード
figma.showUI(__html__, {
  width: 800,  // Data Tableを快適に表示するため幅を拡大
  height: 600,
});

// プラグイン起動時に自動的に変数を読み込む
setTimeout(() => {
  loadLocalVariables();
}, 100);

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
    const variablesData = localVariables.map(variable => {
      const collection = collectionMap.get(variable.variableCollectionId);
      return {
        id: variable.id,
        name: variable.name,
        description: variable.description || '',
        resolvedType: variable.resolvedType,
        collectionId: variable.variableCollectionId,
        collectionName: collection?.name || 'Unknown',
      };
    });
    
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
        },
        {
          id: 'sample-2',
          name: 'spacing/small',
          description: '小さい余白',
          resolvedType: 'FLOAT',
          collectionId: 'collection-1',
        },
        {
          id: 'sample-3',
          name: 'text/heading',
          description: '',
          resolvedType: 'STRING',
          collectionId: 'collection-1',
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