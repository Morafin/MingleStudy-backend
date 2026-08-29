package com.minglestudy.profile

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.Instant

@Entity
@Table(name = "universities")
class University(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
    var name: String = "",
    var country: String = "Uzbekistan",
)

// The university_id index matters because GroupController.myGroup runs
// findByUniversity_Id on every group page load — without it that's a sequential
// scan of the whole table once universities have any real membership.
@Entity
@Table(
    name = "student_profiles",
    indexes = [Index(name = "idx_student_profiles_university_id", columnList = "university_id")],
)
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
    var lastSeenAt: Instant? = null,

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    var createdAt: Instant = Instant.now(),

    @UpdateTimestamp
    @Column(nullable = false)
    var updatedAt: Instant = Instant.now(),
)
