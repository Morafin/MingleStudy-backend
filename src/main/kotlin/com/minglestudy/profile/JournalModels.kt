package com.minglestudy.profile

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.Instant

@Entity
@Table(name = "journal_entries")
class JournalEntry(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    var student: StudentProfile? = null,

    @Column(columnDefinition = "TEXT")
    var content: String = "",

    var createdAt: Instant = Instant.now(),
    var updatedAt: Instant = Instant.now(),
)