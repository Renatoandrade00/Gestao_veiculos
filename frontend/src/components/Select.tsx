import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  className = '',
  id,
  options,
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5 mb-4">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-400 font-sans">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 appearance-none ${
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''
        } ${className}`}
        {...props}
      >
        <option value="" disabled>Selecione uma opção</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-rose-500 mt-0.5">{error}</span>
      )}
    </div>
  );
};
