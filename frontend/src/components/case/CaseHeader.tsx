import React from 'react';

export const CaseHeader: React.FC = () => {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
        Maritime Spill Attribution Console
      </h2>
      <p className="text-xs text-slate-600 leading-relaxed mt-1 max-w-sm">
        Automated SAR intake, slick detection, Euler drift reconstruction, AIS correlation, and vessel-lead ranking for investigator review.
      </p>
    </div>
  );
};
