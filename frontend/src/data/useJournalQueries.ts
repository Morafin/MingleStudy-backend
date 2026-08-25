import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createJournalEntry,
  deleteJournalEntry,
  getMyJournalEntries,
  togglePinJournalEntry,
  updateJournalEntry,
  type JournalEntry,
} from "./journalApi";

const journalKey = ["journal", "mine"];

export function useJournalEntries(initData: string) {
  return useQuery({
    queryKey: journalKey,
    queryFn: () => getMyJournalEntries(initData),
    staleTime: 1000 * 30, // autosave writes often; keep this fresh
    enabled: Boolean(initData),
  });
}

export function useCreateJournalEntry(initData: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content?: string) => createJournalEntry(initData, content),
    onSuccess: (entry) => {
      queryClient.setQueryData<JournalEntry[]>(journalKey, (old) => (old ? [entry, ...old] : [entry]));
    },
  });
}

export function useUpdateJournalEntry(initData: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) => updateJournalEntry(initData, id, content),
    onSuccess: (updated) => {
      queryClient.setQueryData<JournalEntry[]>(journalKey, (old) =>
        old?.map((e) => (e.id === updated.id ? updated : e)),
      );
    },
  });
}

export function useTogglePinJournalEntry(initData: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => togglePinJournalEntry(initData, id),
    onSuccess: (updated) => {
      queryClient.setQueryData<JournalEntry[]>(journalKey, (old) =>
        old?.map((e) => (e.id === updated.id ? updated : e)),
      );
    },
  });
}

export function useDeleteJournalEntry(initData: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteJournalEntry(initData, id),
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: journalKey });
      const previous = queryClient.getQueryData<JournalEntry[]>(journalKey);
      queryClient.setQueryData<JournalEntry[]>(journalKey, (old) => old?.filter((e) => e.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(journalKey, context.previous);
    },
  });
}
