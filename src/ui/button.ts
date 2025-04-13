import { getLogs, getNetworkLogs } from '../core/debugger';
import { DebugOptions } from '../types';
import html2canvas from 'html2canvas';

export function createDebugButton(options: DebugOptions): HTMLButtonElement {
  const button = document.createElement('button');
  button.id = '@owll-debug-button';
  button.innerText = '🦉 Debug';

  button.style.position = 'fixed';
  button.style.zIndex = '9999';
  button.style.padding = '10px 15px';
  button.style.borderRadius = '8px';
  button.style.cursor = 'pointer';
  button.style.fontFamily = 'sans-serif';
  button.style.fontSize = '14px';
  button.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';

  button.style.backgroundColor = options.theme === 'dark' || 
    (options.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ? '#2a2a2a' 
    : '#f0f0f0';

  button.style.color = options.theme === 'dark' || 
    (options.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ? '#ffffff'
    : '#333333';

  const positions = {
    'top-left': { top: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'bottom-right': { bottom: '20px', right: '20px' },
  };
  
  Object.assign(button.style, positions[options.position || 'bottom-right']);

  button.addEventListener('click', async () => {
    const networkLogs = getNetworkLogs();
    const consoleLogs = getLogs();
    const canvas = await html2canvas(document.body, {
      ignoreElements: (element) => element.id === '@owll-debug-button' 
    });
    const timestamp = new Date().toISOString();

    setTimeout(() => {
      downloadJsonFile(consoleLogs, `console_logs_${timestamp}.json`);
    }, 0);

    setTimeout(() => {
      downloadJsonFile(networkLogs, `network_logs_${timestamp}.json`);
    }, 400);

    setTimeout(() => {
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `screenshot_${timestamp}.png`;
      link.click();
    }, 800);
  });

  return button;
}

function downloadJsonFile(jsonData: any, filename: string) {
  const jsonStr = JSON.stringify(jsonData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
