import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full max-w-6xl mx-auto px-4 py-6 mt-auto border-t border-[rgba(232,226,216,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5C574C] font-mono select-none">
      <div className="flex items-center space-x-6 text-[11px]">
        <span className="text-[#9A9488] font-medium">qalampir</span>
        <a href="#contact" className="hover:text-[#9A9488] transition-colors">contact</a>
        <a href="#support" className="hover:text-[#9A9488] transition-colors">support</a>
        <a href="#github" className="hover:text-[#9A9488] transition-colors">github</a>
      </div>

      <div className="flex items-center space-x-6 text-[11px]">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#6FA85C] inline-block animate-pulse"></span>
          <span>v1.0.4-beta</span>
        </div>
      </div>
    </footer>
  );
};
