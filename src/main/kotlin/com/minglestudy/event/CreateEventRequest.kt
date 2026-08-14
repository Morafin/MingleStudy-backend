package com.minglestudy.event

import java.time.Instant

data class CreateEventRequest(
    val telegramId: Long,
    val title: String,
    val startTime: Instant
)
