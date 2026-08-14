package com.minglestudy.event

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.Instant

@Repository
interface StudyEventRepository : JpaRepository<StudyEvent, Long> {
    fun findAllByStartTimeBeforeAndNotifiedFalse(now: Instant): List<StudyEvent>
    fun findByStartTimeLessThanEqualAndNotifiedFalse(now: Instant): List<StudyEvent>
}
