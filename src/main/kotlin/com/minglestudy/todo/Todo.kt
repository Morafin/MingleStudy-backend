package com.minglestudy.todo

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "todos")
class Todo(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    val telegramId: Long,
    val text: String,
    var completed: Boolean = false,
    val createdAt: Instant = Instant.now(),
)