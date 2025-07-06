#!/usr/bin/env node

// Claude Codeの作業完了時に音を鳴らすhook
const { exec } = require('child_process');
const os = require('os');

// macOSの場合、システム音を鳴らす
if (os.platform() === 'darwin') {
  // Glass音を鳴らす（他の音に変更可能: Basso, Blow, Bottle, Frog, Funk, Glass, Hero, Morse, Ping, Pop, Purr, Sosumi, Submarine, Tink）
  exec('afplay /System/Library/Sounds/Glass.aiff', (error) => {
    if (error) {
      console.error('音の再生に失敗しました:', error);
    }
  });
  
  // オプション: 音声で通知
  // exec('say "作業が完了しました"');
}

// Windowsの場合
if (os.platform() === 'win32') {
  // PowerShellでビープ音
  exec('powershell -c [console]::beep(1000,500)');
}