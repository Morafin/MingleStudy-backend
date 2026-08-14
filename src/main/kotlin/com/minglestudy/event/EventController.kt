package com.minglestudy.event

import org.springframework.web.bind.annotation.*

@RestController
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
