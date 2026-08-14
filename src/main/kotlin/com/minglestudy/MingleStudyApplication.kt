package com.minglestudy

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableScheduling
class MingleStudyApplication

fun main(args: Array<String>) {
    runApplication<MingleStudyApplication>(*args)
}
