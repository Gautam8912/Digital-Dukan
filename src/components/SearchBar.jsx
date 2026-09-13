import { Search, X } from 'lucide-react'

export function SearchBar({ value, onChange, placeholder = 'Search products…', autoFocus = false }) {
  return (
    <div className="search-bar">
      <Search size={17} className="search-icon" />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search products"
      />
      {value && (
        <button className="search-clear" onClick={() => onChange('')} aria-label="Clear search">
          <X size={15} />
        </button>
      )}
    </div>
  )
}
