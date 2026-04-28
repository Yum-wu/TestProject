import { useState, useEffect, useCallback } from "react";

export interface FavoriteCity {
  name: string;
  addedAt: number;
}

interface FavoritesProps {
  currentCity: string | null;
  onSelect: (city: string) => void;
}

const STORAGE_KEY = "favorites";

function loadFavorites(): FavoriteCity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [];
}

function saveFavorites(favorites: FavoriteCity[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export default function Favorites({ currentCity, onSelect }: FavoritesProps) {
  const [favorites, setFavorites] = useState<FavoriteCity[]>(() =>
    loadFavorites(),
  );

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const isFavorited =
    currentCity !== null && favorites.some((f) => f.name === currentCity);

  const handleToggle = useCallback(() => {
    if (!currentCity) return;
    setFavorites((prev) => {
      if (prev.some((f) => f.name === currentCity)) {
        return prev.filter((f) => f.name !== currentCity);
      }
      const next = [...prev, { name: currentCity, addedAt: Date.now() }];
      next.sort((a, b) => a.addedAt - b.addedAt);
      return next;
    });
  }, [currentCity]);

  const handleRemove = useCallback((name: string) => {
    setFavorites((prev) => prev.filter((f) => f.name !== name));
  }, []);

  if (favorites.length === 0 && !currentCity) return null;

  return (
    <div className="favorites">
      {currentCity && (
        <button
          className={`fav-toggle ${isFavorited ? "favorited" : ""}`}
          onClick={handleToggle}
        >
          {isFavorited ? "★ 取消收藏" : "☆ 收藏"}
        </button>
      )}
      {favorites.length > 0 && (
        <div className="fav-list">
          <h3>收藏城市</h3>
          <div className="fav-tags">
            {favorites.map((fav) => (
              <span key={fav.name} className="fav-tag">
                <button
                  className="fav-tag-name"
                  onClick={() => onSelect(fav.name)}
                >
                  {fav.name}
                </button>
                <button
                  className="fav-tag-remove"
                  onClick={() => handleRemove(fav.name)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
