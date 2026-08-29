package com.minglestudy.gazette

import org.springframework.data.jpa.repository.JpaRepository

interface GazettePostRepository : JpaRepository<GazettePost, Long> {
    fun existsBySourceUrl(sourceUrl: String): Boolean

    fun findTop60ByOrderByPublishedAtDescFetchedAtDesc(): List<GazettePost>

    fun findTop60ByCategoryOrderByPublishedAtDescFetchedAtDesc(category: String): List<GazettePost>
}