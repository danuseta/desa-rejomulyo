import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, Plus, X, Check } from 'lucide-react';

const Select = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  required,
  className = '',
  placeholder = 'Pilih...',
  creatable = false,
  readOnly = false
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newValue, setNewValue] = useState('');

  const handleSubmitNew = () => {
    if (!newValue.trim()) return;

    // Buat event palsu untuk diproses oleh handler form
    const syntheticEvent = {
      target: {
        name,
        value: newValue.toUpperCase()
      }
    };
    onChange(syntheticEvent);
    setNewValue('');
    setIsAddingNew(false);
  };

  if (readOnly) {
    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-bold text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
          {value || '-'}
        </div>
      </div>
    );
  }

  if (isAddingNew) {
    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-bold text-gray-700 mb-1">
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className={`
                block
                w-full
                px-3
                py-2.5
                text-base
                text-gray-900
                bg-white
                border
                border-gray-300
                rounded-lg
                shadow-sm
                transition
                duration-150
                ease-in-out
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500/20
                focus:border-blue-500
              `}
              placeholder={`Masukkan ${label} baru`}
            />
          </div>
          <button
            type="button"
            onClick={handleSubmitNew}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsAddingNew(false)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-bold text-gray-700 mb-1">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`
            appearance-none
            block
            w-full
            px-3
            py-2.5
            text-base
            text-gray-900
            bg-white
            border
            rounded-lg
            shadow-sm
            cursor-pointer
            transition
            duration-150
            ease-in-out
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500/20
            focus:border-blue-500
            disabled:opacity-50
            disabled:cursor-not-allowed
            ${error ? 'border-rose-500' : 'border-gray-300'}
            ${className}
          `}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {creatable && (
        <button
          type="button"
          onClick={() => setIsAddingNew(true)}
          className="mt-1 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Tambah {label} Baru
        </button>
      )}

      {error && (
        <p className="mt-1 text-sm text-rose-500">{error}</p>
      )}
    </div>
  );
};

Select.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  creatable: PropTypes.bool,
  readOnly: PropTypes.bool
};

export default Select;