package com.minglestudy.gazette

import net.javacrumbs.shedlock.spring.annotation.SchedulerLock
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

@Component
class GazetteFetchScheduler(
    private val gazetteFetchService: GazetteFetchService,
) {
    // Feeds update at most a few times a day, so a 6-hour cadence keeps the gazette
    // fresh without hammering source sites. initialDelay=0 means a fresh deploy (or
    // an empty table) gets its first batch of posts immediately instead of waiting
    // up to 6 hours for the first tick.
    @Scheduled(initialDelay = 0, fixedRate = 6 * 60 * 60 * 1000)
    @SchedulerLock(
        name = "GazetteFetchScheduler_fetchAll",
        lockAtLeastFor = "2m",
        lockAtMostFor = "10m",
    )
    fun fetchAll() {
        gazetteFetchService.fetchAll()
    }
}