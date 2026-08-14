cat << 'EOF' > src/main/kotlin/com/minglestudy/event/EventController.kt
package com.minglestudy.event

import org.springframework.web.bind.annotation.*

@RestController
@CrossOrigin(origins = ["*"])
@RequestMapping("/api/events")
class EventController(
    private val eventRepository: StudyEventRepository
) {

    @PostMapping
    fun createEvent(@RequestBody request: CreateEventRequest): StudyEvent {
        val event = StudyEvent(
            telegramId = request.telegramId,
            title = request.title,
            startTime = request.startTime,
            notified = false
        )
        return eventRepository.save(event)
    }
}
EOF