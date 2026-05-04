import { useState } from 'react';

export default function MultiSelect({ options, selected, onChange, placeholder }) {
  const [open, setOpen] = useState(false);

  const toggle = (val) => {
    if (selected.includes(val)) onChange(selected.filter(v => v !== val));
    else onChange([...selected, val]);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-left text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {selected.length === 0
          ? <span className="text-gray-400">{placeholder}</span>
          : <span>{selected.join(', ')}</span>}
        <span className="float-right text-gray-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg">
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="accent-blue-600"
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}