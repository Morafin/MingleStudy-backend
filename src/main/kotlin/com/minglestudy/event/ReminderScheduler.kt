package com.minglestudy.event

import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate
import java.time.Instant

@Component
class ReminderScheduler(
    private val eventRepository: StudyEventRepository,
    @Value("\${TELEGRAM_BOT_TOKEN:}") private val botToken: String
) {
    private val restTemplate = RestTemplate()

    @Scheduled(fixedRate = 30000)
    fun checkAndSendReminders() {
        val now = Instant.now()
        val dueEvents = eventRepository.findAllByStartTimeBeforeAndNotifiedFalse(now)

        for (event in dueEvents) {
            println("Triggering notification for user ${event.telegramId}: ${event.title}")

            if (botToken.isNotBlank()) {
                sendTelegramMessage(event.telegramId, "⏰ *Study Session Reminder*\n\nEvent: *${event.title}* is starting now!")
            } else {
                println("⚠️ TELEGRAM_BOT_TOKEN environment variable is missing in Railway!")
            }

            event.notified = true
            eventRepository.save(event)
        }
    }

    private fun sendTelegramMessage(chatId: Long, text: String) {
        try {
            val url = "https://api.telegram.org/bot$botToken/sendMessage"
            val body = mapOf(
                "chat_id" to chatId,
                "text" to text,
                "parse_mode" to "Markdown"
            )
            restTemplate.postForObject(url, body, String::class.java)
            println("✅ Telegram message sent to $chatId")
        } catch (e: Exception) {
            println("❌ Failed to send Telegram message: ${e.message}")
        }
    }
}
