package com.minglestudy.profile

import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

data class BookResponse(
    val id: Long,
    val title: String,
    val author: String,
    val coverUrl: String?,
    val fileUrl: String?,
    val description: String?,
    val category: String?,
)

data class CreateBookRequest(
    @field:NotBlank @field:Size(max = 200) val title: String,
    @field:NotBlank @field:Size(max = 150) val author: String,
    @field:Size(max = 500) val coverUrl: String? = null,
    @field:Size(max = 500) val fileUrl: String? = null,
    @field:Size(max = 2000) val description: String? = null,
    @field:Size(max = 80) val category: String? = null,
)

@RestController
@RequestMapping("/api/books")
class BookController(
    private val books: BookRepository,
    private val telegramAuth: TelegramAuthService,
    @Value("\${minglestudy.admin-key:}") private val adminKey: String,
) {
    @GetMapping
    fun listBooks(@RequestHeader("X-Telegram-Init-Data") initData: String): List<BookResponse> {
        telegramAuth.verify(initData)
        return books.findAllByOrderByTitleAsc().map { it.toResponse() }
    }

    @PostMapping
    fun addBook(
        @RequestHeader("X-Admin-Key") providedKey: String,
        @Valid @RequestBody request: CreateBookRequest,
    ): BookResponse {
        if (adminKey.isBlank() || providedKey != adminKey) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid admin key")
        }
        val book = Book(
            title = request.title.trim(),
            author = request.author.trim(),
            coverUrl = request.coverUrl?.trim()?.ifBlank { null },
            fileUrl = request.fileUrl?.trim()?.ifBlank { null },
            description = request.description?.trim()?.ifBlank { null },
            category = request.category?.trim()?.ifBlank { null },
        )
        return books.save(book).toResponse()
    }

    private fun Book.toResponse() = BookResponse(
        requireNotNull(id), title, author, coverUrl, fileUrl, description, category,
    )
}
