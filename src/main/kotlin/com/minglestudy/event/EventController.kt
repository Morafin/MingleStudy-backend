package com.minglestudy.event

import com.minglestudy.profile.TelegramAuthService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.time.Instant

data class StudyEventResponse(
    val id: Long,
    val title: String,
    val startTime: Instant,
    val notified: Boolean,
)

// No @CrossOrigin here — CORS for /api/** is already handled globally by WebConfig,
// scoped to the app's real origin. The previous origins = ["*"] plus a client-supplied
// telegramId meant anyone on the internet could POST an event (and trigger a bot
// notification) to any Telegram user's ID. Every endpoint below now verifies
// X-Telegram-Init-Data and derives telegramId from that, never from the request body.
@RestController
@RequestMapping("/api/events")
class EventController(
    private val eventRepository: StudyEventRepository,
    private val telegramAuth: TelegramAuthService,
) {
    @GetMapping("/mine")
    fun myEvents(@RequestHeader("X-Telegram-Init-Data") initData: String): List<StudyEventResponse> {
        val user = telegramAuth.verify(initData)
        return eventRepository.findByTelegramIdOrderByStartTimeAsc(user.id).map { it.toResponse() }
    }

    @PostMapping
    fun createEvent(
        @RequestHeader("X-Telegram-Init-Data") initData: String,
        @Valid @RequestBody request: CreateEventRequest,
    ): StudyEventResponse {
        val user = telegramAuth.verify(initData)
        val event = StudyEvent(
            telegramId = user.id,
            title = request.title.trim(),
            startTime = request.startTime,
            notified = false,
        )
        return eventRepository.save(event).toResponse()
    }

    @Transactional
    @DeleteMapping("/{id}")
    fun deleteEvent(
        @RequestHeader("X-Telegram-Init-Data") initData: String,
        @PathVariable id: Long,
    ) {
        val user = telegramAuth.verify(initData)
        val deleted = eventRepository.deleteByIdAndTelegramId(id, user.id)
        if (deleted == 0L) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found")
        }
    }

    private fun StudyEvent.toResponse() = StudyEventResponse(requireNotNull(id), title, startTime, notified)
}