package com.minglestudy.todo

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface TodoRepository : JpaRepository<Todo, Long> {
    fun findByTelegramIdOrderByCreatedAtAsc(telegramId: Long): List<Todo>
    fun findByIdAndTelegramId(id: Long, telegramId: Long): Optional<Todo>
    fun deleteByIdAndTelegramId(id: Long, telegramId: Long): Long
}