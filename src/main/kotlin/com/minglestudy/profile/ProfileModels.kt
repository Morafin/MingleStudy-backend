package com.minglestudy.profile

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table

@Entity
@Table(name = "universities")
class University(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
    var name: String = "",
    var country: String = "Uzbekistan",
)

@Entity
@Table(name = "student_profiles")
class StudentProfile(
    @Id
    var telegramId: Long = 0,
    var telegramUsername: String? = null,
    var telegramPhotoUrl: String? = null,
    var firstName: String = "",
    var lastName: String = "",
    var bio: String? = null,
    @ManyToOne
    @JoinColumn(name = "university_id")
    var university: University? = null,
    var onboardingComplete: Boolean = false,
)
