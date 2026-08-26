import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addUniversity,
  getMyGroup,
  getMyProfile,
  joinViaInvite,
  saveProfile,
  searchUniversities,
} from "./profileApi";

export function useMyProfile(initData: string) {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => getMyProfile(initData),
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(initData),
  });
}

export function useUniversitySearch(initData: string, query: string) {
  return useQuery({
    queryKey: ["universities", "search", query],
    queryFn: () => searchUniversities(initData, query),
    staleTime: 1000 * 60 * 10,
  });
}

export function useAddUniversity(initData: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => addUniversity(initData, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universities", "search"] });
    },
  });
}

export function useSaveProfile(initData: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: { firstName: string; lastName: string; bio: string; universityId: number }) =>
      saveProfile(initData, values),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", "me"], data);
      queryClient.invalidateQueries({ queryKey: ["profile", "group"] });
    },
  });
}

export function useMyGroup(initData: string) {
  return useQuery({
    queryKey: ["profile", "group"],
    queryFn: () => getMyGroup(initData),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(initData),
  });
}

export function useJoinInvite(initData: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (universityId: number) => joinViaInvite(initData, universityId),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", "me"], data.profile);
      queryClient.invalidateQueries({ queryKey: ["profile", "group"] });
    },
  });
}
