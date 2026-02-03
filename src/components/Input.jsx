import React from 'react';

const Input = ({ label, type = 'text', name, value, onChange, placeholder, error, options, ...props }) => {
  const baseClasses = "w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20";
  const errorClasses = error ? "border-red-500 bg-red-50" : "border-slate-200 focus:border-blue-500 bg-slate-50";

  if (type === 'select') {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>}
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`${baseClasses} ${errorClasses} appearance-none bg-no-repeat bg-[right_1rem_center]`}
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundSize: '1.25rem' }}
          {...props}
        >
          <option value="">Select {label}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${baseClasses} ${errorClasses}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
    </div>
  );
};

export default Input;
