package com.minglestudy.profile

import org.springframework.data.jpa.repository.JpaRepository

interface BookRepository : JpaRepository<Book, Long> {
    fun findAllByOrderByTitleAsc(): List<Book>
}
