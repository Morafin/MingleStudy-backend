package com.minglestudy.profile

import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Instant

data class GroupMemberResponse(
    val telegramId: Long,
    val firstName: String,
    val lastName: String,
    val username: String?,
    val photoUrl: String?,
    val bio: String?,
    val lastSeenAt: Instant?,
)

data class MyGroupResponse(
    val hasUniversity: Boolean,
    val university: UniversityResponse?,
    val memberCount: Int,
    val members: List<GroupMemberResponse>,
    // True when memberCount exceeds the members list below — lets the frontend show
    // "showing the first N of memberCount" instead of implying the list is complete.
    val truncated: Boolean,
)

@RestController
@RequestMapping("/api/groups")
class GroupController(
    private val profiles: StudentProfileRepository,
    private val telegramAuth: TelegramAuthService,
) {
    // Caps how many members a single group page load fetches. findByUniversity_Id
    // previously pulled every student at the university into memory unconditionally —
    // fine at 50 students, a real problem once a university has hundreds. +1 over the
    // display cap so filtering out the current user still leaves a full page.
    private val maxGroupMembers = 200

    @GetMapping("/mine")
    fun myGroup(@RequestHeader("X-Telegram-Init-Data") initData: String): MyGroupResponse {
        val user = telegramAuth.verify(initData)
        val me = profiles.findById(user.id).orElse(null)
        val university = me?.university

        if (university == null) {
            return MyGroupResponse(
                hasUniversity = false,
                university = null,
                memberCount = 0,
                members = emptyList(),
                truncated = false,
            )
        }

        val universityId = requireNotNull(university.id)
        val totalMemberCount = profiles.countByUniversity_Id(universityId) - 1 // exclude self
        val page = PageRequest.of(0, maxGroupMembers + 1, Sort.by(Sort.Order.asc("firstName"), Sort.Order.asc("lastName")))
        val classmates = profiles.findByUniversity_Id(universityId, page)
            .filter { it.telegramId != user.id }
            .take(maxGroupMembers)
            .map {
                GroupMemberResponse(
                    telegramId = it.telegramId,
                    firstName = it.firstName,
                    lastName = it.lastName,
                    username = it.telegramUsername,
                    photoUrl = it.telegramPhotoUrl,
                    bio = it.bio,
                    lastSeenAt = it.lastSeenAt,
                )
            }

        return MyGroupResponse(
            hasUniversity = true,
            university = UniversityResponse(
                id = universityId,
                name = university.name,
                country = university.country,
                studentCount = profiles.countByUniversity_Id(universityId),
            ),
            memberCount = totalMemberCount.toInt(),
            members = classmates,
            truncated = totalMemberCount.toInt() > classmates.size,
        )
    }
}
