import { initializeDebugWidget } from './core/debugger';
import { DebugOptions } from './types';

export default function startOwllDebugWidget(options?: DebugOptions) {
  console.log("🦉 Owll Debug Widget Initialized!");
  initializeDebugWidget(options); 
}

if (typeof window !== 'undefined') {
  startOwllDebugWidget(); 
}
