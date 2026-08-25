package com.minglestudy.event

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.Instant

@Repository
interface StudyEventRepository : JpaRepository<StudyEvent, Long> {
    fun findAllByStartTimeBeforeAndNotifiedFalse(now: Instant): List<StudyEvent>
    fun findByTelegramIdOrderByStartTimeAsc(telegramId: Long): List<StudyEvent>
    fun deleteByIdAndTelegramId(id: Long, telegramId: Long): Long
}