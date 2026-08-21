package com.minglestudy.profile

import org.springframework.data.jpa.repository.JpaRepository

interface JournalEntryRepository : JpaRepository<JournalEntry, Long> {
    fun findByStudent_TelegramIdOrderByPinnedDescUpdatedAtDesc(telegramId: Long): List<JournalEntry>
    fun findByIdAndStudent_TelegramId(id: Long, telegramId: Long): JournalEntry?
    fun deleteByIdAndStudent_TelegramId(id: Long, telegramId: Long): Long
}