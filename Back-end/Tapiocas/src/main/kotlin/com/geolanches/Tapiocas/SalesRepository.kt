package com.geolanches.Tapiocas

import jakarta.persistence.*
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.math.BigDecimal
import java.time.LocalDateTime

data class PaymentRequest(
    val idFood: Long,          // ID do alimento
    val cpf: String,           // CPF do cliente
    val description: String,   // Descrição da venda
    val additionalPrice: BigDecimal // Preço adicional
)

@Entity
@Table(name = "sales")
data class Sales(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // ID gerado automaticamente
    val id: Int? = null,  // Permite que o ID seja nulo inicialmente
    val idfood: Long,
    val cpf: String,
    val datesale: LocalDateTime,
    val description: String,
    val price: Float
)

interface SalesRepository: JpaRepository<Sales, Int> {
    @Query("select * from sales where cpf = :cpf", nativeQuery = true)
    fun getAllSalesByCpfClient(@Param("cpf") cpf: String): List<Sales>
}
