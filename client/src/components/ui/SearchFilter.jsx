import React from 'react';
import PropTypes from 'prop-types';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Input from './Input';

const SearchFilter = ({ 
  value = '', 
  onSearch, 
  placeholder = "Search...",
  className = '' 
}) => {
  const handleChange = (e) => {
    onSearch(e.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      <Input
        name="search"
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        className="pl-10"
      />
    </div>
  );
};

SearchFilter.propTypes = {
  value: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string
};

export default SearchFilter;