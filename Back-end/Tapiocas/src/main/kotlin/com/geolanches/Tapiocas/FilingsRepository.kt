package com.geolanches.Tapiocas

import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

@Entity
@Table(name = "filings")
data class Filings (
    @Id val id: Int,
    val idFood: Int,
    val name: String,
    val price: Float,
)

interface FilingsRepository: JpaRepository<Filings, Int> {

   @Query("Select name, price from filings where idfood = :id", nativeQuery = true)
    fun getAllFilingsByFoodId(@Param("id")id: Int): List<Map<String, Float>>

}