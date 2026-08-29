package com.minglestudy.gazette

import com.minglestudy.profile.TelegramAuthService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.Instant

data class GazettePostResponse(
    val id: Long,
    val title: String,
    val summary: String,
    val sourceName: String,
    val sourceUrl: String,
    val category: String,
    val publishedAt: Instant?,
)

@RestController
@RequestMapping("/api/gazette")
class GazetteController(
    private val posts: GazettePostRepository,
    private val telegramAuth: TelegramAuthService,
) {
    @GetMapping
    fun listPosts(
        @RequestHeader("X-Telegram-Init-Data") initData: String,
        @RequestParam(required = false) category: String?,
    ): List<GazettePostResponse> {
        telegramAuth.verify(initData)
        val results = if (category.isNullOrBlank()) {
            posts.findTop60ByOrderByPublishedAtDescFetchedAtDesc()
        } else {
            posts.findTop60ByCategoryOrderByPublishedAtDescFetchedAtDesc(category.uppercase())
        }
        return results.map { it.toResponse() }
    }

    @GetMapping("/categories")
    fun listCategories(@RequestHeader("X-Telegram-Init-Data") initData: String): List<String> {
        telegramAuth.verify(initData)
        return GazetteCategory.entries.map { it.name }
    }

    private fun GazettePost.toResponse() = GazettePostResponse(
        id = requireNotNull(id),
        title = title,
        summary = summary,
        sourceName = sourceName,
        sourceUrl = sourceUrl,
        category = category,
        publishedAt = publishedAt,
    )
}