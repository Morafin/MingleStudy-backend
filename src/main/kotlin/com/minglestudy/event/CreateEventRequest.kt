package com.minglestudy.event

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant

// telegramId is intentionally NOT part of this request — it's derived server-side
// from the verified Telegram initData, never trusted from the client. Accepting it
// from the request body was how anyone could previously schedule a bot notification
// to an arbitrary Telegram user.
data class CreateEventRequest(
    @field:NotBlank @field:Size(max = 200) val title: String,
    val startTime: Instant,
)