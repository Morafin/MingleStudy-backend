package com.minglestudy.gazette

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

enum class GazetteCategory {
    STUDY_TIPS,
    WELLBEING,
    CAMPUS_LIFE,
    HIGHER_ED_NEWS,
}

@Entity
@Table(name = "gazette_posts")
class GazettePost(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false, length = 500)
    var title: String,

    // Always a short teaser derived from the source feed's own description —
    // never the full article body. The app links out for the rest; see
    // GazetteFetchService.teaser().
    @Column(nullable = false, length = 700)
    var summary: String,

    @Column(name = "source_name", nullable = false, length = 120)
    var sourceName: String,

    @Column(name = "source_url", nullable = false)
    var sourceUrl: String,

    @Column(nullable = false, length = 40)
    var category: String,

    @Column(name = "published_at")
    var publishedAt: Instant? = null,

    @Column(name = "fetched_at", nullable = false)
    var fetchedAt: Instant = Instant.now(),
)