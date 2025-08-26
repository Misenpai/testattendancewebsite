'use client';

import type { Filters } from '../types';



function FiltersSection({ 
  filters, 
  onFilterChange, 
  onLoadData 
}: {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onLoadData: () => void;
}) {
  const handleInputChange = (key: keyof Filters, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    onFilterChange(newFilters);
  };

  return (
    <div className="filters">
      <div className="filter-group">
        <label htmlFor="month-select">Month</label>
        <select 
          id="month-select"
          value={filters.month} 
          onChange={(e) => handleInputChange('month', parseInt(e.target.value))}
        >
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label htmlFor="year-select">Year</label>
        <select 
          id="year-select"
          value={filters.year} 
          onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
        >
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label htmlFor="api-base-input">API Base URL</label>
        <input 
          id="api-base-input"
          type="text" 
          value={filters.apiBase}
          onChange={(e) => handleInputChange('apiBase', e.target.value)}
          placeholder="http://localhost:3000/api"
        />
      </div>
      
      <button className="btn" onClick={onLoadData}>
        Load Data
      </button>
    </div>
  );
}

export default FiltersSection;