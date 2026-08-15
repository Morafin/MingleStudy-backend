package com.minglestudy.profile

import org.springframework.data.jpa.repository.JpaRepository

interface StudentProfileRepository : JpaRepository<StudentProfile, Long> {
    fun countByUniversity_Id(universityId: Long): Long
    fun findByUniversity_Id(universityId: Long): List<StudentProfile>
}

interface UniversityRepository : JpaRepository<University, Long> {
    fun findTop10ByNameContainingIgnoreCaseOrderByNameAsc(query: String): List<University>
    fun findFirstByNameIgnoreCase(name: String): University?
}