import React from 'react';
import PropTypes from 'prop-types';

const Input = ({
  label,
  name,
  type = 'text',
  error,
  className = '',
  required,
  value = '', // Add default empty string
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-bold text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value} // Ensure value is always defined
        className={`
          block w-full px-3 py-2.5
          text-base text-gray-900
          bg-white border border-gray-300 
          rounded-lg shadow-sm
          transition duration-150 ease-in-out
          focus:outline-none focus:ring-2 
          focus:ring-blue-500/20 focus:border-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-500' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-rose-500">{error}</p>
      )}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
  required: PropTypes.bool,
  value: PropTypes.string,
};

export default Input;