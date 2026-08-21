package com.minglestudy.profile

import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.http.HttpStatus
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.time.LocalDate

data class JournalEntryResponse(
    val id: Long,
    val date: LocalDate,
    val content: String,
    val updatedAt: Instant,
)

data class JournalEntryRequest(
    val date: LocalDate,
    @field:NotBlank @field:Size(max = 5000) val content: String,
)

@RestController
@RequestMapping("/api/journal")
class JournalController(
    private val entries: JournalEntryRepository,
    private val profiles: StudentProfileRepository,
    private val telegramAuth: TelegramAuthService,
) {
    @GetMapping("/mine")
    fun myEntries(@RequestHeader("X-Telegram-Init-Data") initData: String): List<JournalEntryResponse> {
        val user = telegramAuth.verify(initData)
        return entries.findByStudent_TelegramIdOrderByEntryDateDesc(user.id).map { it.toResponse() }
    }

    @PostMapping
    fun upsertEntry(
        @RequestHeader("X-Telegram-Init-Data") initData: String,
        @Valid @RequestBody request: JournalEntryRequest,
    ): JournalEntryResponse {
        val student = studentOf(initData)
        val existing = entries.findByStudent_TelegramIdAndEntryDate(student.telegramId, request.date)
        val entry = existing ?: JournalEntry(student = student, entryDate = request.date)
        entry.content = request.content.trim()
        entry.updatedAt = Instant.now()
        return entries.save(entry).toResponse()
    }

    @Transactional
    @DeleteMapping("/{id}")
    fun deleteEntry(@RequestHeader("X-Telegram-Init-Data") initData: String, @PathVariable id: Long) {
        val user = telegramAuth.verify(initData)
        val deleted = entries.deleteByIdAndStudent_TelegramId(id, user.id)
        if (deleted == 0L) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Journal entry not found")
        }
    }

    private fun studentOf(initData: String): StudentProfile {
        val user = telegramAuth.verify(initData)
        return profiles.findById(user.id).orElseThrow {
            ResponseStatusException(HttpStatus.BAD_REQUEST, "Complete your profile before journaling")
        }
    }

    private fun JournalEntry.toResponse() = JournalEntryResponse(
        requireNotNull(id), entryDate, content, updatedAt,
    )
}