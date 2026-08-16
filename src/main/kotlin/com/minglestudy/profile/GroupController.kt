package com.minglestudy.profile

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
)

@RestController
@RequestMapping("/api/groups")
class GroupController(
    private val profiles: StudentProfileRepository,
    private val telegramAuth: TelegramAuthService,
) {
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
            )
        }

        val universityId = requireNotNull(university.id)
        val classmates = profiles.findByUniversity_Id(universityId)
            .filter { it.telegramId != user.id }
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
            memberCount = classmates.size,
            members = classmates,
        )
    }
}