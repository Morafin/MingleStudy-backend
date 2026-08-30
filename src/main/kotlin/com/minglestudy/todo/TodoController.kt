package com.minglestudy.todo

import com.minglestudy.profile.TelegramAuthService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.time.Instant

data class TodoResponse(
    val id: Long,
    val text: String,
    val completed: Boolean,
    val createdAt: Instant,
)

@RestController
@RequestMapping("/api/todos")
class TodoController(
    private val todos: TodoRepository,
    private val telegramAuth: TelegramAuthService,
) {
    @GetMapping("/mine")
    fun myTodos(@RequestHeader("X-Telegram-Init-Data") initData: String): List<TodoResponse> {
        val user = telegramAuth.verify(initData)
        return todos.findByTelegramIdOrderByCreatedAtAsc(user.id).map { it.toResponse() }
    }

    @PostMapping
    fun createTodo(
        @RequestHeader("X-Telegram-Init-Data") initData: String,
        @Valid @RequestBody request: CreateTodoRequest,
    ): TodoResponse {
        val user = telegramAuth.verify(initData)
        val todo = Todo(telegramId = user.id, text = request.text.trim())
        return todos.save(todo).toResponse()
    }

    @PatchMapping("/{id}/toggle")
    fun toggleTodo(
        @RequestHeader("X-Telegram-Init-Data") initData: String,
        @PathVariable id: Long,
    ): TodoResponse {
        val user = telegramAuth.verify(initData)
        val todo = todos.findByIdAndTelegramId(id, user.id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Todo not found") }
        todo.completed = !todo.completed
        return todos.save(todo).toResponse()
    }

    @DeleteMapping("/{id}")
    fun deleteTodo(
        @RequestHeader("X-Telegram-Init-Data") initData: String,
        @PathVariable id: Long,
    ) {
        val user = telegramAuth.verify(initData)
        val deleted = todos.deleteByIdAndTelegramId(id, user.id)
        if (deleted == 0L) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Todo not found")
        }
    }

    private fun Todo.toResponse() = TodoResponse(requireNotNull(id), text, completed, createdAt)
}