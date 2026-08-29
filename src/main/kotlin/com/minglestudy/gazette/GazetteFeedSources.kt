package com.minglestudy.gazette

data class GazetteFeedSource(
    val name: String,
    val url: String,
    val category: GazetteCategory,
)

// Curated list of public education/student-life RSS feeds. Add or remove
// entries here at any time — GazetteFetchScheduler picks up the current list
// on every run, no code changes needed elsewhere.
object GazetteFeedSources {
    val ALL = listOf(
        GazetteFeedSource(
            name = "Inside Higher Ed",
            url = "https://www.insidehighered.com/rss.xml",
            category = GazetteCategory.HIGHER_ED_NEWS,
        ),
        GazetteFeedSource(
            name = "The 74",
            url = "https://www.the74million.org/feed/",
            category = GazetteCategory.HIGHER_ED_NEWS,
        ),
        GazetteFeedSource(
            name = "eSchool News",
            url = "https://www.eschoolnews.com/feed/",
            category = GazetteCategory.CAMPUS_LIFE,
        ),
        GazetteFeedSource(
            name = "MindShift (KQED)",
            url = "https://ww2.kqed.org/mindshift/feed/",
            category = GazetteCategory.STUDY_TIPS,
        ),
        GazetteFeedSource(
            name = "The Hechinger Report",
            url = "https://hechingerreport.org/feed/",
            category = GazetteCategory.WELLBEING,
        ),
    )
}