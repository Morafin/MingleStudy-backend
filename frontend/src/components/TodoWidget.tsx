import { useState } from "react";
import { useCreateTodo, useDeleteTodo, useToggleTodo, useTodos } from "../data/useTodoQueries";
import type { Todo } from "../data/todoApi";

type TodoWidgetProps = {
    initData: string;
};

function TodoRow({
                     todo,
                     onToggle,
                     onDelete,
                     isLast,
                 }: {
    todo: Todo;
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
    isLast: boolean;
}) {
    return (
        <div className={"ios-row todo-row" + (isLast ? " todo-row-last" : "")}>
            <button
                className={"todo-checkbox" + (todo.completed ? " is-checked" : "")}
                onClick={() => onToggle(todo.id)}
                aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
            >
                {todo.completed && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </button>
            <span className={"todo-text" + (todo.completed ? " is-completed" : "")}>{todo.text}</span>
            <button className="todo-delete" onClick={() => onDelete(todo.id)} aria-label="Delete task">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

export default function TodoWidget({ initData }: TodoWidgetProps) {
    const { data: todos, isLoading } = useTodos(initData);
    const createMutation = useCreateTodo(initData);
    const toggleMutation = useToggleTodo(initData);
    const deleteMutation = useDeleteTodo(initData);
    const [draft, setDraft] = useState("");

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const text = draft.trim();
        if (!text) return;
        createMutation.mutate(text);
        setDraft("");
    };

    const pending = todos?.filter((t) => !t.completed) ?? [];
    const done = todos?.filter((t) => t.completed) ?? [];
    const ordered = [...pending, ...done];

    return (
        <div className="todo-widget dashboard-grid-span">
            <div className="ios-group-label">To-Do</div>

            <form className="todo-add-row" onSubmit={handleAdd}>
                <input
                    className="todo-add-input"
                    type="text"
                    placeholder="Add a task…"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    maxLength={300}
                />
                <button className="todo-add-button" type="submit" disabled={!draft.trim()}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m-7-7h14" />
                    </svg>
                </button>
            </form>

            {isLoading && (
                <div className="ios-group">
                    <div className="ios-row">
                        <div className="skeleton skeleton-line full" />
                    </div>
                </div>
            )}

            {!isLoading && ordered.length === 0 && (
                <div className="todo-empty">
                    <p>Nothing on your list yet.</p>
                </div>
            )}

            {!isLoading && ordered.length > 0 && (
                <div className="ios-group">
                    {ordered.map((todo, index) => (
                        <TodoRow
                            key={todo.id}
                            todo={todo}
                            onToggle={(id) => toggleMutation.mutate(id)}
                            onDelete={(id) => deleteMutation.mutate(id)}
                            isLast={index === ordered.length - 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}