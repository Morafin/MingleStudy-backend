package com.minglestudy

import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.swagger.v3.oas.models.security.SecurityScheme
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class OpenApiConfig {

    @Bean
    fun customOpenAPI(): OpenAPI {
        return OpenAPI()
            .info(
                Info()
                    .title("MingleStudy Platform API")
                    .version("1.0.0")
                    .description("REST services for study group management, scheduling, journaling, and library access.")
            )
            .addSecurityItem(SecurityRequirement().addList("TelegramInitData"))
            .components(
                Components().addSecuritySchemes(
                    "TelegramInitData",
                    SecurityScheme()
                        .type(SecurityScheme.Type.APIKEY)
                        .`in`(SecurityScheme.In.HEADER)
                        .name("X-Telegram-Init-Data")
                        .description("Raw Telegram WebApp initData string, verified server-side via HMAC-SHA256")
                )
            )
    }
}
