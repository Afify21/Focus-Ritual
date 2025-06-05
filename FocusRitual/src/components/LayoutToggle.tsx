import React from 'react';
import { DocumentArrowDownIcon, Squares2X2Icon, WindowIcon } from '@heroicons/react/24/solid';
import DataService from '../services/DataService';

interface LayoutToggleProps {
  onSaveLayout: () => void;
  onToggleMode: () => void;
  currentMode: 'windows' | 'fixed';
}

const LayoutToggle: React.FC<LayoutToggleProps> = ({ onSaveLayout, onToggleMode, currentMode }) => {
  return (
    <div className="fixed bottom-4 right-4 flex gap-2 z-[10002]">
      {currentMode === 'windows' && (
        <button
          onClick={onSaveLayout}
          className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-colors"
          title="Save current layout"
        >
          <DocumentArrowDownIcon className="h-5 w-5" />
        </button>
      )}
      <button
        onClick={onToggleMode}
        className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white shadow-lg transition-colors"
        title={currentMode === 'windows' ? 'Switch to fixed layout' : 'Switch to window layout'}
      >
        {currentMode === 'windows' ? (
          <Squares2X2Icon className="h-5 w-5" />
        ) : (
          <WindowIcon className="h-5 w-5" />
        )}
      </button>
    </div>
  );
};

export default LayoutToggle;