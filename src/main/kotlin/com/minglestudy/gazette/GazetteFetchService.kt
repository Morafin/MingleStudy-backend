package com.minglestudy.gazette

import com.rometools.rome.feed.synd.SyndEntry
import com.rometools.rome.io.SyndFeedInput
import com.rometools.rome.io.XmlReader
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.net.URI
import java.net.URLConnection
import java.time.Instant

@Component
class GazetteFetchService(
    private val posts: GazettePostRepository,
) {
    @Transactional
    fun fetchAll() {
        GazetteFeedSources.ALL.forEach { source ->
            try {
                fetchOne(source)
            } catch (e: Exception) {
                // One dead/slow feed shouldn't take the rest of the gazette down with it.
                println("⚠️ Gazette fetch failed for ${source.name}: ${e.message}")
            }
        }
    }

    private fun fetchOne(source: GazetteFeedSource) {
        val connection: URLConnection = URI(source.url).toURL().openConnection()
        connection.connectTimeout = 8000
        connection.readTimeout = 8000
        connection.setRequestProperty("User-Agent", "MingleStudyGazetteBot/1.0")

        val feed = connection.getInputStream().use { stream -> SyndFeedInput().build(XmlReader(stream)) }

        // Only the most recent handful per feed per run — older items were already
        // captured on a previous tick (or never will be, which is fine).
        feed.entries.take(15).forEach { entry: SyndEntry ->
            val link = entry.link?.trim().orEmpty()
            if (link.isBlank() || posts.existsBySourceUrl(link)) return@forEach

            val rawSummary = entry.description?.value ?: entry.contents?.firstOrNull()?.value
            val summary = teaser(plainText(rawSummary)).ifBlank { "Read the full story at ${source.name}." }
            val publishedAt = (entry.publishedDate ?: entry.updatedDate)?.toInstant()

            posts.save(
                GazettePost(
                    title = plainText(entry.title).ifBlank { "Untitled" }.take(500),
                    summary = summary,
                    sourceName = source.name,
                    sourceUrl = link,
                    category = source.category.name,
                    publishedAt = publishedAt,
                    fetchedAt = Instant.now(),
                ),
            )
        }
    }

    // RSS descriptions often carry HTML markup — strip it so the card feed shows
    // plain, readable text (the app never renders this as HTML).
    private fun plainText(html: String?): String {
        if (html.isNullOrBlank()) return ""
        return html.replace(Regex("<[^>]*>"), " ").replace(Regex("\\s+"), " ").trim()
    }

    // Deliberately short — this is a teaser, not a reproduction of the article.
    // Students always click through to the source for the rest.
    private fun teaser(text: String, maxLength: Int = 320): String {
        if (text.length <= maxLength) return text
        val cut = text.substring(0, maxLength)
        val lastSpace = cut.lastIndexOf(' ')
        return (if (lastSpace > 0) cut.substring(0, lastSpace) else cut).trimEnd() + "…"
    }
}