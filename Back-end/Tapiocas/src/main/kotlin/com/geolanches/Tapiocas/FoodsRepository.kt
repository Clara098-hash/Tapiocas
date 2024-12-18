package com.geolanches.Tapiocas

import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.springframework.data.jpa.repository.JpaRepository

@Entity
@Table(name = "foods")
data class Foods (
    @Id val id: Int,
    val name: String,
    val price: Float
)
interface FoodsRepository: JpaRepository<Foods, Int> {
}