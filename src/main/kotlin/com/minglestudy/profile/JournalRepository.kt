package com.minglestudy.profile

import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDate

interface JournalEntryRepository : JpaRepository<JournalEntry, Long> {
    fun findByStudent_TelegramIdOrderByEntryDateDesc(telegramId: Long): List<JournalEntry>
    fun findByStudent_TelegramIdAndEntryDate(telegramId: Long, entryDate: LocalDate): JournalEntry?
    fun deleteByIdAndStudent_TelegramId(id: Long, telegramId: Long): Long
}