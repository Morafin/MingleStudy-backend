package com.minglestudy.event

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "study_events")
class StudyEvent(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    val telegramId: Long,
    val title: String,
    val startTime: Instant,
    var notified: Boolean = false
)
