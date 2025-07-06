#!/usr/bin/env node

// Claude Codeの作業完了時に音を鳴らすhook
const { execSync } = require('child_process');
const os = require('os');

console.log('🔔 Hook実行: 作業完了の通知');

try {
  // macOSの場合、システム音を鳴らす
  if (os.platform() === 'darwin') {
    // Ping音を鳴らす（他の音に変更可能: Basso, Blow, Bottle, Frog, Funk, Glass, Hero, Morse, Ping, Pop, Purr, Sosumi, Submarine, Tink）
    execSync('afplay /System/Library/Sounds/Ping.aiff');
    console.log('✅ 音を再生しました');
    
    // オプション: 音声で通知（コメントを外して使用）
    // execSync('say "作業が完了しました"');
  }
  
  // Windowsの場合
  else if (os.platform() === 'win32') {
    // PowerShellでビープ音
    execSync('powershell -c [console]::beep(1000,500)');
  }
  
  // Linuxの場合
  else if (os.platform() === 'linux') {
    // paplayコマンドがある場合
    try {
      execSync('paplay /usr/share/sounds/freedesktop/stereo/complete.oga');
    } catch {
      // beepコマンドを試す
      try {
        execSync('beep');
      } catch {
        console.log('⚠️ 音を再生できませんでした');
      }
    }
  }
} catch (error) {
  console.error('❌ 音の再生に失敗しました:', error.message);
}