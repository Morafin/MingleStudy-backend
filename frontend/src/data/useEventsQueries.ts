import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createEvent, deleteEvent, getMyEvents, type StudyEvent } from "./eventsApi";

const eventsKey = ["events", "mine"];

export function useMyEvents(initData: string) {
    return useQuery({
        queryKey: eventsKey,
        queryFn: () => getMyEvents(initData),
        staleTime: 1000 * 60,
        enabled: Boolean(initData),
    });
}

export function useCreateEvent(initData: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ title, startTime }: { title: string; startTime: string }) =>
            createEvent(initData, title, startTime),
        onSuccess: (event) => {
            queryClient.setQueryData<StudyEvent[]>(eventsKey, (old) => (old ? [...old, event] : [event]));
        },
    });
}

export function useDeleteEvent(initData: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteEvent(initData, id),
        onMutate: async (id: number) => {
            await queryClient.cancelQueries({ queryKey: eventsKey });
            const previous = queryClient.getQueryData<StudyEvent[]>(eventsKey);
            queryClient.setQueryData<StudyEvent[]>(eventsKey, (old) => old?.filter((e) => e.id !== id));
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) queryClient.setQueryData(eventsKey, context.previous);
        },
    });
}
