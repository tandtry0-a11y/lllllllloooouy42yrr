import React from 'react';
import { ModelIds, ModelOption } from '../types';
import { SettingsIcon, TrashIcon, SparklesIcon } from './Icons';

interface SidebarProps {
  currentModel: string;
  onModelChange: (id: string) => void;
  onClearChat: () => void;
}

const models: ModelOption[] = [
  { id: ModelIds.FLASH, name: 'Gemini 2.5 Flash', description: 'Fast, efficient, low latency' },
  { id: ModelIds.PRO, name: 'Gemini 3 Pro', description: 'Reasoning, coding, complex tasks' },
];

const Sidebar: React.FC<SidebarProps> = ({ currentModel, onModelChange, onClearChat }) => {
  return (
    <div className="w-full h-full flex flex-col bg-dark-lighter border-r border-gray-800">
      <div className="p-6 border-b border-gray-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
            <SparklesIcon className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Gemini Flow
        </h1>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="mb-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-3 px-2">
                <SettingsIcon className="w-4 h-4" />
                <span>Model Selection</span>
            </div>
            
            <div className="space-y-2">
                {models.map((model) => (
                    <button
                        key={model.id}
                        onClick={() => onModelChange(model.id)}
                        className={`
                            w-full text-left p-3 rounded-xl transition-all duration-200 border
                            ${currentModel === model.id 
                                ? 'bg-gray-800 border-indigo-500/50 shadow-md shadow-indigo-900/10' 
                                : 'bg-transparent border-transparent hover:bg-gray-800/50 text-gray-400'}
                        `}
                    >
                        <div className={`font-medium ${currentModel === model.id ? 'text-indigo-400' : 'text-gray-300'}`}>
                            {model.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {model.description}
                        </div>
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-800">
        <button 
            onClick={onClearChat}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors border border-red-500/20"
        >
            <TrashIcon className="w-4 h-4" />
            <span>Clear Conversation</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;