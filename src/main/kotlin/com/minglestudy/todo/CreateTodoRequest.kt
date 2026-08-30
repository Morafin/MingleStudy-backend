package com.minglestudy.todo

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

// telegramId is intentionally NOT part of this request — same reasoning as
// CreateEventRequest: it's derived server-side from verified Telegram initData,
// never trusted from the client.
data class CreateTodoRequest(
    @field:NotBlank @field:Size(max = 300) val text: String,
)