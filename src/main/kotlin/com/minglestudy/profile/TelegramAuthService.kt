package com.minglestudy.profile

import tools.jackson.databind.json.JsonMapper
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.net.URLDecoder
import java.nio.charset.StandardCharsets
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

data class TelegramUser(
    val id: Long,
    val firstName: String,
    val lastName: String?,
    val username: String?,
    val photoUrl: String?,
)

@Service
class TelegramAuthService(
    @Value("\${minglestudy.telegram.bot-token}") private val botToken: String,
    private val jsonMapper: JsonMapper,
) {
    fun verify(initData: String?): TelegramUser {
        if (initData.isNullOrBlank() || botToken.isBlank()) unauthorized()

        val values = initData.split('&').mapNotNull { item ->
            val separator = item.indexOf('=')
            if (separator < 0) null else URLDecoder.decode(item.substring(0, separator), StandardCharsets.UTF_8) to
                    URLDecoder.decode(item.substring(separator + 1), StandardCharsets.UTF_8)
        }.toMap()
        val suppliedHash = values["hash"] ?: unauthorized()
        val dataCheckString = values.filterKeys { it != "hash" }
            .toSortedMap()
            .entries.joinToString("\n") { "${it.key}=${it.value}" }
        val secretKey = hmac("WebAppData".toByteArray(), botToken.toByteArray())
        val calculatedHash = hmac(secretKey, dataCheckString.toByteArray()).joinToString("") { "%02x".format(it) }
        if (!constantTimeEquals(suppliedHash, calculatedHash)) unauthorized()

        val userJson = values["user"] ?: unauthorized()
        val user = jsonMapper.readTree(userJson)
        return TelegramUser(
            id = user.path("id").asLong(),
            firstName = user.path("first_name").asText(),
            lastName = user.path("last_name").asText().ifBlank { null },
            username = user.path("username").asText().ifBlank { null },
            photoUrl = user.path("photo_url").asText().ifBlank { null },
        )
    }

    private fun hmac(key: ByteArray, value: ByteArray): ByteArray =
        Mac.getInstance("HmacSHA256").run {
            init(SecretKeySpec(key, "HmacSHA256"))
            doFinal(value)
        }

    private fun constantTimeEquals(left: String, right: String): Boolean {
        if (left.length != right.length) return false
        var result = 0
        left.indices.forEach { result = result or (left[it].code xor right[it].code) }
        return result == 0
    }

    private fun unauthorized(): Nothing = throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Telegram authentication failed")
}