import { useState, useEffect, useRef } from "react";
import { searchIngredients } from "../services/ingredient.service";
import { IngredientResponse } from "../types";

interface AutocompleteIngredientInputProps {
  value: string;
  onSelect: (ingredient: IngredientResponse) => void;
  placeholder?: string;
}

export default function AutocompleteIngredientInput({
  value,
  onSelect,
  placeholder,
}: AutocompleteIngredientInputProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<IngredientResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isDefault = placeholder === "Type ingredient...";

  // Fetch suggestions with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (!query) {
        setSuggestions([]);
        return;
      }
      try {
        setLoading(true);
        const res = await searchIngredients(query); // trả về IngredientResponse[]
        setSuggestions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce 300ms

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (ingredient: IngredientResponse) => {
    onSelect(ingredient);
    setQuery(ingredient.name);
    console.log(ingredient);
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
        handleSelect(suggestions[highlightIndex]);
      }
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        type="text"
        className={`w-full p-2 rounded-lg border text-gray-900 ${isDefault ? "placeholder:text-gray-600" : "placeholder:text-gray-900"}`}
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        onKeyDown={handleKeyDown}
      />

      {showDropdown && (
        <div className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
          {loading ? (
            <div className="p-2 text-gray-500">Loading...</div>
          ) : suggestions.length ? (
            suggestions.map((item, index) => (
              <div
                key={item.id}
                className={`p-2 cursor-pointer bg-white hover:bg-emerald-100 hover:text-white dark:hover:bg-emerald-900/30 ${
                  highlightIndex === index
                    ? "bg-emerald-200 dark:bg-emerald-800"
                    : ""
                }`}
                onMouseDown={(e) => e.preventDefault()} // prevent blur
                onClick={() => handleSelect(item)}
              >
                {item.name}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500">No results</div>
          )}
        </div>
      )}
    </div>
  );
}
