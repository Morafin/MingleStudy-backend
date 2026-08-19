package com.minglestudy.profile

import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table

enum class Weekday { MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY }

@Entity
@Table(name = "class_schedule_entries")
class ClassScheduleEntry(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    var student: StudentProfile? = null,

    @Enumerated(EnumType.STRING)
    var day: Weekday = Weekday.MONDAY,

    var startTime: String = "",
    var endTime: String = "",
    var subject: String = "",
    var type: String = "Seminar",
    var teacher: String? = null,
    var room: String? = null,
)