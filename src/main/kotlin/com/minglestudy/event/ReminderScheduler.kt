package com.minglestudy.event

import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.Instant

@Component
class ReminderScheduler(
    private val eventRepository: StudyEventRepository
) {

    @Scheduled(fixedRate = 30000)
    fun checkAndSendReminders() {
        val now = Instant.now()
        val dueEvents = eventRepository.findAllByStartTimeBeforeAndNotifiedFalse(now)

        for (event in dueEvents) {
            println("Triggering notification for user ${event.telegramId}: ${event.title}")

            event.notified = true
            eventRepository.save(event)
        }
    }
}
