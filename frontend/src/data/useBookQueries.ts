import { useQuery } from "@tanstack/react-query";
import { getBooks } from "./bookApi";

export function useBooks(initData: string) {
  return useQuery({
    queryKey: ["books"],
    queryFn: () => getBooks(initData),
    staleTime: 1000 * 60 * 10, // catalog changes rarely
    enabled: Boolean(initData),
  });
}
