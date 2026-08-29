import { useQuery } from "@tanstack/react-query";
import { getGazettePosts } from "./gazetteApi";

export function useGazettePosts(initData: string, category?: string) {
    return useQuery({
        queryKey: ["gazette", "posts", category ?? "all"],
        queryFn: () => getGazettePosts(initData, category),
        enabled: Boolean(initData),
        staleTime: 5 * 60 * 1000, // feed refreshes every 6h server-side, no need to poll hard
    });
}