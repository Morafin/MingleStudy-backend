package com.minglestudy.profile

import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class SeedData {
    @Bean
    fun seedUniversities(universities: UniversityRepository) = CommandLineRunner {
        listOf(
            "National University of Uzbekistan", "Tashkent University of Information Technologies",
            "Westminster International University in Tashkent", "Tashkent State University of Economics",
            "Tashkent State Technical University", "Amity University Tashkent", "INHA University in Tashkent",
            "MDIST in Tashkent", "Webster University in Tashkent", "Samarkand State University",
            "Fergana State University", "University of World Economy and Diplomacy",
        ).forEach { name -> if (universities.findFirstByNameIgnoreCase(name) == null) universities.save(University(name = name)) }
    }
}
