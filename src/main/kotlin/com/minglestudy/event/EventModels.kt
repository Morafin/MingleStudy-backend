package com.minglestudy.event

import jakarta.persistence.*
import org.springframework.data.jpa.repository.JpaRepository
import java.time.Instant

@Entity
@Table(name = "study_events")
data class StudyEvent(
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    val telegramId: Long,
    val title: String,
    val startTime: Instant,
    var notified: Boolean = false
)

interface StudyEventRepository : JpaRepository<StudyEvent, Long> {
    fun findByStartTimeLessThanEqualAndNotifiedFalse(now: Instant): List<StudyEvent>
}

data class CreateEventRequest(
    val telegramId: Long,
    val title: String,
    val startTime: Instant
)
