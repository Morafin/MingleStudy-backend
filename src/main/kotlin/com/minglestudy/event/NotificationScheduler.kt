package com.minglestudy.event

import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate
import java.time.Instant

@Component
class NotificationScheduler(
    private val eventRepository: StudyEventRepository,
    @Value("\${telegram.bot.token}") private val botToken: String
) {
    private val restTemplate = RestTemplate()

    @Scheduled(fixedRate = 60000)
    fun checkAndSendNotifications() {
        val now = Instant.now()
        val dueEvents = eventRepository.findByStartTimeLessThanEqualAndNotifiedFalse(now)

        for (event in dueEvents) {
            try {
                sendTelegramNotification(event.telegramId, event.title)
                
                event.notified = true
                eventRepository.save(event)
            } catch (e: Exception) {
                println("Failed to send notification for event ${event.id}: ${e.message}")
            }
        }
    }

    private fun sendTelegramNotification(chatId: Long, title: String) {
        val url = "https://api.telegram.org/bot$botToken/sendMessage"
        val payload = mapOf(
            "chat_id" to chatId,
            "text" to "🔔 *MingleStudy Reminder*\n\nYour study event *\"$title\"* is starting now!",
            "parse_mode" to "Markdown"
        )
        restTemplate.postForObject(url, payload, String::class.java)
    }
}
