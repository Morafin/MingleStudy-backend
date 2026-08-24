package com.minglestudy.profile

import org.springframework.beans.factory.annotation.Value
import org.springframework.core.io.FileSystemResource
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.io.File
import java.util.UUID

data class BookResponse(
    val id: Long,
    val title: String,
    val author: String,
    val coverUrl: String?,
    val fileUrl: String?,
    val description: String?,
    val category: String?,
)

@RestController
@RequestMapping("/api/books")
class BookController(
    private val books: BookRepository,
    private val telegramAuth: TelegramAuthService,
    @Value("\${minglestudy.admin-key:}") private val adminKey: String,
    @Value("\${minglestudy.storage-path:/data/books}") private val storagePath: String,
    @Value("\${minglestudy.public-url:http://localhost:8080}") private val publicUrl: String,
) {
    @GetMapping
    fun listBooks(@RequestHeader("X-Telegram-Init-Data") initData: String): List<BookResponse> {
        telegramAuth.verify(initData)
        return books.findAllByOrderByTitleAsc().map { it.toResponse() }
    }

    @PostMapping(consumes = ["multipart/form-data"])
    fun addBook(
        @RequestHeader("X-Admin-Key") providedKey: String,
        @RequestParam title: String,
        @RequestParam author: String,
        @RequestParam(required = false) coverUrl: String?,
        @RequestParam(required = false) description: String?,
        @RequestParam(required = false) category: String?,
        @RequestParam(required = false) externalFileUrl: String?,
        @RequestParam(required = false) file: MultipartFile?,
    ): BookResponse {
        if (adminKey.isBlank() || providedKey != adminKey) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid admin key")
        }

        val book = Book(
            title = title.trim(),
            author = author.trim(),
            coverUrl = coverUrl?.trim()?.ifBlank { null },
            description = description?.trim()?.ifBlank { null },
            category = category?.trim()?.ifBlank { null },
        )

        if (file != null && !file.isEmpty) {
            val dir = File(storagePath)
            if (!dir.exists() && !dir.mkdirs()) {
                throw ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not create storage directory at $storagePath — check that it exists and is writable (e.g. a mounted volume on Railway).",
                )
            }
            val storedName = "${UUID.randomUUID()}.pdf"
            val target = File(dir, storedName)

            // Copy the stream manually rather than relying on MultipartFile.transferTo()/Part.write(),
            // which resolves relative paths against Tomcat's internal multipart temp location and can
            // silently write to the wrong (nonexistent) directory if that location is misconfigured.
            try {
                file.inputStream.use { input ->
                    target.outputStream().use { output ->
                        input.copyTo(output)
                    }
                }
            } catch (e: Exception) {
                throw ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to save uploaded file: ${e.message}",
                )
            }

            book.storedFileName = storedName
        } else if (!externalFileUrl.isNullOrBlank()) {
            book.fileUrl = externalFileUrl.trim()
        }

        return books.save(book).toResponse()
    }

    @GetMapping("/{id}/file")
    fun getBookFile(@PathVariable id: Long): ResponseEntity<FileSystemResource> {
        val book = books.findById(id).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found")
        }
        val storedName = book.storedFileName
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "No uploaded file for this book")
        val file = File(storagePath, storedName)
        if (!file.exists()) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "File missing on disk")
        }
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"${sanitizeFilename(book.title)}.pdf\"")
            .body(FileSystemResource(file))
    }

    private fun sanitizeFilename(name: String): String = name.replace(Regex("[^a-zA-Z0-9-_ ]"), "").trim().ifBlank { "book" }

    private fun Book.toResponse() = BookResponse(
        id = requireNotNull(id),
        title = title,
        author = author,
        coverUrl = coverUrl,
        fileUrl = storedFileName?.let { "$publicUrl/api/books/$id/file" } ?: fileUrl,
        description = description,
        category = category,
    )
}