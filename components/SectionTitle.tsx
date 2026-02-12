import React from 'react';

interface Props {
  title: string;
}

const SectionTitle: React.FC<Props> = ({ title }) => {
  return (
    <div className="flex items-center mb-8">
      <div className="h-4 w-1 bg-f1-pink rounded-full mr-3 shadow-glow"></div>
      <h3 className="text-lg font-black font-display uppercase tracking-widest text-slate-900">{title}</h3>
      <div className="h-[1px] bg-slate-200 flex-grow ml-4"></div>
    </div>
  );
};

export default SectionTitle;