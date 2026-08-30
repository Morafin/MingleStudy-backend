import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTodo, deleteTodo, getMyTodos, toggleTodo, type Todo } from "./todoApi";

const TODOS_KEY = ["todos", "mine"];

export function useTodos(initData: string) {
    return useQuery({
        queryKey: TODOS_KEY,
        queryFn: () => getMyTodos(initData),
        enabled: Boolean(initData),
    });
}

export function useCreateTodo(initData: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (text: string) => createTodo(initData, text),
        onSuccess: (created) => {
            queryClient.setQueryData<Todo[]>(TODOS_KEY, (current) => [...(current ?? []), created]);
        },
    });
}

export function useToggleTodo(initData: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => toggleTodo(initData, id),
        // Optimistic toggle: flips the checkbox instantly, rolls back on failure —
        // matches the optimistic-delete pattern already used in StudyCalendar.
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: TODOS_KEY });
            const previous = queryClient.getQueryData<Todo[]>(TODOS_KEY);
            queryClient.setQueryData<Todo[]>(TODOS_KEY, (current) =>
                current?.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
            );
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) queryClient.setQueryData(TODOS_KEY, context.previous);
        },
    });
}

export function useDeleteTodo(initData: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteTodo(initData, id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: TODOS_KEY });
            const previous = queryClient.getQueryData<Todo[]>(TODOS_KEY);
            queryClient.setQueryData<Todo[]>(TODOS_KEY, (current) => current?.filter((todo) => todo.id !== id));
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) queryClient.setQueryData(TODOS_KEY, context.previous);
        },
    });
}