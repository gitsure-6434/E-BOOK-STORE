import { createContext, useCallback, useContext, useMemo, useState } from "react";
import api from "../services/api";

const BookContext = createContext(null);

export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshBooks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/books");
      setBooks(Array.isArray(data) ? data : []);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      books,
      loading,
      refreshBooks,
      setBooks
    }),
    [books, loading, refreshBooks]
  );

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
};

export const useBooks = () => {
  const ctx = useContext(BookContext);
  if (!ctx) throw new Error("useBooks must be used within BookProvider");
  return ctx;
};
