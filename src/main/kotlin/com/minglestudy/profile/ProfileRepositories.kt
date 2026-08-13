package com.minglestudy.profile

import org.springframework.data.jpa.repository.JpaRepository

interface StudentProfileRepository : JpaRepository<StudentProfile, Long>

interface UniversityRepository : JpaRepository<University, Long> {
    fun findTop10ByNameContainingIgnoreCaseOrderByNameAsc(query: String): List<University>
    fun findFirstByNameIgnoreCase(name: String): University?
}
