import { useState } from 'react';
import { Search } from 'lucide-react';

interface Props {
  onSearch: (term: string) => void;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

export default function ProjectFilters({ onSearch, onCategoryChange, categories }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onCategoryChange(category);
  };

  return (
    <div className="mb-8 space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={20} className="text-gray-400 dark:text-dark-400" />
        </div>
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-dark-800 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryChange('all')}
          className={`px-4 py-2 rounded-full text-sm font-mono transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-500 text-white dark:bg-blue-600'
              : 'bg-gray-200 dark:bg-dark-800 text-gray-700 dark:text-dark-300 hover:bg-gray-300 dark:hover:bg-dark-700'
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 rounded-full text-sm font-mono transition-colors ${
              selectedCategory === category
                ? 'bg-blue-500 text-white dark:bg-blue-600'
                : 'bg-gray-200 dark:bg-dark-800 text-gray-700 dark:text-dark-300 hover:bg-gray-300 dark:hover:bg-dark-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}