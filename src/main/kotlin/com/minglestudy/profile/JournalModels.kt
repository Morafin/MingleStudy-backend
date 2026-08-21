package com.minglestudy.profile

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint
import java.time.Instant
import java.time.LocalDate

@Entity
@Table(
    name = "journal_entries",
    uniqueConstraints = [UniqueConstraint(columnNames = ["student_id", "entry_date"])]
)
class JournalEntry(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    var student: StudentProfile? = null,

    @Column(name = "entry_date", nullable = false)
    var entryDate: LocalDate = LocalDate.now(),

    @Column(columnDefinition = "TEXT")
    var content: String = "",

    var updatedAt: Instant = Instant.now(),
)