package com.minglestudy.profile

import org.springframework.transaction.annotation.Transactional
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

private const val TIME_PATTERN = "^([01]\\d|2[0-3]):[0-5]\\d$"

data class ScheduleEntryResponse(
    val id: Long,
    val day: Weekday,
    val startTime: String,
    val endTime: String,
    val subject: String,
    val type: String,
    val teacher: String?,
    val room: String?,
)

data class ScheduleEntryRequest(
    val day: Weekday,
    @field:Pattern(regexp = TIME_PATTERN, message = "startTime must be HH:MM") val startTime: String,
    @field:Pattern(regexp = TIME_PATTERN, message = "endTime must be HH:MM") val endTime: String,
    @field:NotBlank @field:Size(max = 120) val subject: String,
    @field:NotBlank @field:Size(max = 40) val type: String,
    @field:Size(max = 120) val teacher: String? = null,
    @field:Size(max = 80) val room: String? = null,
)

data class BulkScheduleRequest(@field:Valid val entries: List<ScheduleEntryRequest>)

@RestController
@RequestMapping("/api/schedule")
class ScheduleController(
    private val entries: ClassScheduleEntryRepository,
    private val profiles: StudentProfileRepository,
    private val telegramAuth: TelegramAuthService,
) {
    @GetMapping("/mine")
    fun mySchedule(@RequestHeader("X-Telegram-Init-Data") initData: String): List<ScheduleEntryResponse> {
        val user = telegramAuth.verify(initData)
        return entries.findByStudent_TelegramIdOrderByDayAscStartTimeAsc(user.id).map { it.toResponse() }
    }

    @GetMapping("/{id}")
    fun getEntry(
        @RequestHeader("X-Telegram-Init-Data") initData: String,
        @PathVariable id: Long
    ): ScheduleEntryResponse {
        val user = telegramAuth.verify(initData)
        val entry = entries.findById(id).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule entry not found")
        }
        if (entry.student?.telegramId != user.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Not your schedule entry")
        }
        return entry.toResponse()
    }

    @PostMapping
    fun addEntry(
        @RequestHeader("X-Telegram-Init-Data") initData: String,
        @Valid @RequestBody request: ScheduleEntryRequest,
    ): ScheduleEntryResponse {
        val student = studentOf(initData)
        validateTimeRange(request)
        return entries.save(request.toEntity(student)).toResponse()
    }

    @PostMapping("/bulk")
    fun addEntriesBulk(
        @RequestHeader("X-Telegram-Init-Data") initData: String,
        @Valid @RequestBody request: BulkScheduleRequest,
    ): List<ScheduleEntryResponse> {
        val student = studentOf(initData)
        request.entries.forEach { validateTimeRange(it) }
        val saved = entries.saveAll(request.entries.map { it.toEntity(student) })
        return saved.map { it.toResponse() }
    }

    @PutMapping("/{id}")
    fun updateEntry(
        @RequestHeader("X-Telegram-Init-Data") initData: String,
        @PathVariable id: Long,
        @Valid @RequestBody request: ScheduleEntryRequest,
    ): ScheduleEntryResponse {
        val user = telegramAuth.verify(initData)
        validateTimeRange(request)
        val entry = entries.findById(id).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule entry not found")
        }
        if (entry.student?.telegramId != user.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Not your schedule entry")
        }
        entry.day = request.day
        entry.startTime = request.startTime
        entry.endTime = request.endTime
        entry.subject = request.subject.trim()
        entry.type = request.type.trim()
        entry.teacher = request.teacher?.trim()?.ifBlank { null }
        entry.room = request.room?.trim()?.ifBlank { null }
        return entries.save(entry).toResponse()
    }

    @Transactional
    @DeleteMapping("/{id}")
    fun deleteEntry(@RequestHeader("X-Telegram-Init-Data") initData: String, @PathVariable id: Long) {
        val user = telegramAuth.verify(initData)
        val deleted = entries.deleteByIdAndStudent_TelegramId(id, user.id)
        if (deleted == 0L) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule entry not found")
        }
    }

    private fun studentOf(initData: String): StudentProfile {
        val user = telegramAuth.verify(initData)
        return profiles.findById(user.id).orElseThrow {
            ResponseStatusException(HttpStatus.BAD_REQUEST, "Complete your profile before adding a schedule")
        }
    }

    private fun validateTimeRange(request: ScheduleEntryRequest) {
        if (request.endTime <= request.startTime) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "endTime must be after startTime")
        }
    }

    private fun ScheduleEntryRequest.toEntity(student: StudentProfile) = ClassScheduleEntry(
        student = student,
        day = day,
        startTime = startTime,
        endTime = endTime,
        subject = subject.trim(),
        type = type.trim(),
        teacher = teacher?.trim()?.ifBlank { null },
        room = room?.trim()?.ifBlank { null },
    )

    private fun ClassScheduleEntry.toResponse() = ScheduleEntryResponse(
        requireNotNull(id), day, startTime, endTime, subject, type, teacher, room,
    )
}