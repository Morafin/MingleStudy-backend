package com.minglestudy.profile

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

@Entity
@Table(name = "books")
class Book(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    var title: String = "",
    var author: String = "",
    var coverUrl: String? = null,
    var fileUrl: String? = null,

    @Column(columnDefinition = "TEXT")
    var description: String? = null,

    var category: String? = null,
    var createdAt: Instant = Instant.now(),
)
