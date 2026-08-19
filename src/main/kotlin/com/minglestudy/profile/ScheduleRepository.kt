package com.minglestudy.profile

import org.springframework.data.jpa.repository.JpaRepository

interface ClassScheduleEntryRepository : JpaRepository<ClassScheduleEntry, Long> {
    fun findByStudent_TelegramIdOrderByDayAscStartTimeAsc(telegramId: Long): List<ClassScheduleEntry>
    fun deleteByIdAndStudent_TelegramId(id: Long, telegramId: Long): Long
}