package com.minglestudy.profile

import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

data class UniversityResponse(val id: Long, val name: String, val country: String, val studentCount: Long)
data class ProfileResponse(
    val telegramId: Long,
    val firstName: String,
    val lastName: String,
    val bio: String?,
    val username: String?,
    val photoUrl: String?,
    val university: UniversityResponse?,
    val onboardingComplete: Boolean,
)
data class UpdateProfileRequest(
    @field:NotBlank @field:Size(max = 80) val firstName: String,
    @field:NotBlank @field:Size(max = 80) val lastName: String,
    @field:Size(max = 500) val bio: String? = null,
    val universityId: Long,
)
data class CreateUniversityRequest(@field:NotBlank @field:Size(max = 180) val name: String)

@RestController
@RequestMapping("/api")
class ProfileController(
    private val profiles: StudentProfileRepository,
    private val universities: UniversityRepository,
    private val telegramAuth: TelegramAuthService,
) {
    @GetMapping("/me")
    fun currentProfile(@RequestHeader("X-Telegram-Init-Data") initData: String): ProfileResponse =
        profiles.save(findOrCreate(telegramAuth.verify(initData))).toResponse()

    @PutMapping("/me")
    fun updateProfile(
        @RequestHeader("X-Telegram-Init-Data") initData: String,
        @Valid @RequestBody request: UpdateProfileRequest,
    ): ProfileResponse {
        val profile = findOrCreate(telegramAuth.verify(initData))
        val university = universities.findById(request.universityId).orElseThrow {
            ResponseStatusException(HttpStatus.BAD_REQUEST, "University not found")
        }
        profile.firstName = request.firstName.trim()
        profile.lastName = request.lastName.trim()
        profile.bio = request.bio?.trim()?.ifBlank { null }
        profile.university = university
        profile.onboardingComplete = true
        return profiles.save(profile).toResponse()
    }

    @GetMapping("/universities")
    fun searchUniversities(@RequestParam(defaultValue = "") query: String): List<UniversityResponse> =
        universities.findTop10ByNameContainingIgnoreCaseOrderByNameAsc(query.trim()).map { it.toResponse() }

    @PostMapping("/universities")
    fun addUniversity(
        @RequestHeader("X-Telegram-Init-Data") initData: String,
        @Valid @RequestBody request: CreateUniversityRequest,
    ): UniversityResponse {
        telegramAuth.verify(initData)
        val name = request.name.trim()
        return (universities.findFirstByNameIgnoreCase(name) ?: universities.save(University(name = name))).toResponse()
    }

    private fun findOrCreate(user: TelegramUser): StudentProfile = profiles.findById(user.id).orElseGet {
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

    private fun StudentProfile.toResponse() = ProfileResponse(
        telegramId, firstName, lastName, bio, telegramUsername, telegramPhotoUrl, university?.toResponse(), onboardingComplete,
    )

    private fun University.toResponse() = UniversityResponse(
        requireNotNull(id), name, country, profiles.countByUniversity_Id(requireNotNull(id)),
    )
}