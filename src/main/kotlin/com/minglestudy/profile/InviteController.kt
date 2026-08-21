package com.minglestudy.profile

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

data class JoinViaInviteRequest(val universityId: Long)
data class JoinViaInviteResponse(
    val joined: Boolean,
    val reason: String?, // "already_in_this_university" | "already_in_other_university" | null
    val profile: ProfileResponse,
)

@RestController
@RequestMapping("/api/invite")
class InviteController(
    private val profiles: StudentProfileRepository,
    private val universities: UniversityRepository,
    private val telegramAuth: TelegramAuthService,
) {
    // Called when the Mini App is opened via a t.me/<bot>?startapp=uni_<id> deep link.
    // Auto-joins the recipient to that university ONLY if they don't already have one set —
    // we never silently switch someone out of a university they already picked.
    @PostMapping("/join")
    fun joinViaInvite(
        @RequestHeader("X-Telegram-Init-Data") initData: String,
        @RequestBody request: JoinViaInviteRequest,
    ): JoinViaInviteResponse {
        val user = telegramAuth.verify(initData)
        val university = universities.findById(request.universityId).orElseThrow {
            ResponseStatusException(HttpStatus.BAD_REQUEST, "University not found")
        }

        val profile = profiles.findById(user.id).orElseGet {
            StudentProfile(
                telegramId = user.id,
                telegramUsername = user.username,
                telegramPhotoUrl = user.photoUrl,
                firstName = user.firstName,
                lastName = user.lastName.orEmpty(),
            )
        }.also {
            it.telegramUsername = user.username
            it.telegramPhotoUrl = user.photoUrl
        }

        val existingUniversityId = profile.university?.id

        if (existingUniversityId == requireNotNull(university.id)) {
            return JoinViaInviteResponse(joined = false, reason = "already_in_this_university", profile = profiles.save(profile).toResponse())
        }
        if (existingUniversityId != null) {
            return JoinViaInviteResponse(joined = false, reason = "already_in_other_university", profile = profiles.save(profile).toResponse())
        }

        profile.university = university
        // Deliberately NOT setting onboardingComplete = true here — first/last name may still
        // be Telegram defaults. The frontend routes them into the profile form (pre-filled with
        // this university already selected) to confirm their name before finishing onboarding.
        val saved = profiles.save(profile)
        return JoinViaInviteResponse(joined = true, reason = null, profile = saved.toResponse())
    }

    private fun StudentProfile.toResponse() = ProfileResponse(
        telegramId, firstName, lastName, bio, telegramUsername, telegramPhotoUrl, university?.toResponse(), onboardingComplete,
    )

    private fun University.toResponse() = UniversityResponse(
        requireNotNull(id), name, country, profiles.countByUniversity_Id(requireNotNull(id)),
    )
}