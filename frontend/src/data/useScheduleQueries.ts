import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createScheduleEntriesBulk,
    createScheduleEntry,
    deleteScheduleEntry,
    getMySchedule,
    updateScheduleEntry,
    type ScheduleEntry,
    type ScheduleEntryInput,
} from "./scheduleApi";

const scheduleKey = ["schedule", "mine"];

export function useMySchedule(initData: string) {
    return useQuery({
        queryKey: scheduleKey,
        queryFn: () => getMySchedule(initData),
        staleTime: 1000 * 60 * 5,
        enabled: Boolean(initData),
    });
}

export function useCreateScheduleEntry(initData: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (entry: ScheduleEntryInput) => createScheduleEntry(initData, entry),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: scheduleKey }),
    });
}

export function useCreateScheduleEntriesBulk(initData: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (entries: ScheduleEntryInput[]) => createScheduleEntriesBulk(initData, entries),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: scheduleKey }),
    });
}

export function useUpdateScheduleEntry(initData: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, entry }: { id: number; entry: ScheduleEntryInput }) =>
            updateScheduleEntry(initData, id, entry),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: scheduleKey }),
    });
}

export function useDeleteScheduleEntry(initData: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteScheduleEntry(initData, id),
        onMutate: async (id: number) => {
            await queryClient.cancelQueries({ queryKey: scheduleKey });
            const previous = queryClient.getQueryData<ScheduleEntry[]>(scheduleKey);
            queryClient.setQueryData<ScheduleEntry[]>(scheduleKey, (old) => old?.filter((e) => e.id !== id));
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) queryClient.setQueryData(scheduleKey, context.previous);
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: scheduleKey }),
    });
}
