import { useState, useRef, useEffect, type FormEvent } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed && !loading) {
      onSearch(trimmed);
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="输入城市名称，如：北京"
        disabled={loading}
      />
      <button type="submit" disabled={loading || !query.trim()}>
        {loading ? "查询中…" : "搜索"}
      </button>
    </form>
  );
}
