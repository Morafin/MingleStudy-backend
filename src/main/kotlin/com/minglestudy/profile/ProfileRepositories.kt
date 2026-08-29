package com.minglestudy.profile

import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository

interface StudentProfileRepository : JpaRepository<StudentProfile, Long> {
    fun countByUniversity_Id(universityId: Long): Long

    // Pageable overload used by GroupController so a large university can't pull its
    // entire membership into memory on every group page load. Kept alongside the
    // unbounded version below since it's still the correct call for anything that
    // genuinely needs every member rather than a capped page.
    fun findByUniversity_Id(universityId: Long, pageable: Pageable): List<StudentProfile>
    fun findByUniversity_Id(universityId: Long): List<StudentProfile>
}

interface UniversityRepository : JpaRepository<University, Long> {
    fun findTop10ByNameContainingIgnoreCaseOrderByNameAsc(query: String): List<University>
    fun findFirstByNameIgnoreCase(name: String): University?
}
