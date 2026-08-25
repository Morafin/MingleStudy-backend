package com.minglestudy

import org.springframework.http.HttpStatus
import org.springframework.http.ProblemDetail
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler
import java.net.URI
import java.time.Instant
import java.util.NoSuchElementException

// ResponseStatusException thrown anywhere in the app (see ProfileController,
// EventController) is already converted to RFC 9457 ProblemDetail JSON automatically
// by Spring, now that spring.mvc.problemdetails.enabled=true. This class only needs
// to catch what falls through the cracks: exceptions that aren't already a
// ResponseStatusException.
@RestControllerAdvice
class GlobalExceptionHandler : ResponseEntityExceptionHandler() {

    @ExceptionHandler(NoSuchElementException::class)
    fun handleNotFound(ex: NoSuchElementException): ProblemDetail =
        ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.message ?: "Resource not found").apply {
            title = "Resource Not Found"
            type = URI.create("https://minglestudy.app/errors/not-found")
            setProperty("timestamp", Instant.now())
        }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleBadRequest(ex: IllegalArgumentException): ProblemDetail =
        ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.message ?: "Invalid request").apply {
            title = "Invalid Request"
            type = URI.create("https://minglestudy.app/errors/bad-request")
            setProperty("timestamp", Instant.now())
        }

    @ExceptionHandler(Exception::class)
    fun handleUnexpected(ex: Exception): ProblemDetail {
        logger.error("Unhandled exception", ex)
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong. Please try again.").apply {
            title = "Internal Server Error"
            type = URI.create("https://minglestudy.app/errors/internal")
            setProperty("timestamp", Instant.now())
        }
    }
}
