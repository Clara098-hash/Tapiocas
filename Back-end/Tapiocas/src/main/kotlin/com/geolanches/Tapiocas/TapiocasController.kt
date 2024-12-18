package com.geolanches.Tapiocas

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter


@RestController
@CrossOrigin
class TapiocasController(val foodsRepository: FoodsRepository,
                         val filingsRepository: FilingsRepository,
                         val salesRepository: SalesRepository) {

    // Endpoint para buscar todos os alimentos
    @GetMapping("/foods")
    fun getAllFoods(): List<Map<String, Any>> {
        try {
            // Buscar todos os alimentos do banco de dados
            val foods: List<Foods> = foodsRepository.findAll()

            // Criar uma lista de mapas com as informações de cada alimento
            val response: List<Map<String, Any>> = foods.map {
                mapOf(
                    "id" to it.id,
                    "name" to it.name,
                    "price" to it.price
                )
            }

            return response
        } catch (e: Exception) {
            return listOf(mapOf("error" to e.message.toString()))
        }
    }

    // Endpoint para buscar os dados do alimento por id
    @GetMapping("/filings")
    fun getFilingsByFoodId(@RequestParam("idFood") idFood: Int): Map<String, Any> {
        try {
            val food = foodsRepository.findById(idFood)
            if (food.isEmpty) {
                return mapOf("error" to "Alimento não encontrado")
            }

            val filings: List<Map<String, Float>> = filingsRepository.getAllFilingsByFoodId(idFood)

            val response: Map<String, Any> =
                mapOf(
                    "price" to food.get().price,
                    "filings" to filings
                )

            return response
        } catch (e: Exception) {
            return mapOf("error" to e.message.toString())
        }
    }

    // Endpoint para buscar o histórico de vendas
    @GetMapping("/history")
    fun getAllSalesByCpfClient(@RequestParam("cpf") cpf: String): List<Sales> {
        return salesRepository.getAllSalesByCpfClient(cpf)
    }

    // Endpoint para processar o pagamento e salvar a venda
    @RequestMapping("/payment")
    @PostMapping
    fun processPayment(@RequestBody paymentRequest: PaymentRequest): ResponseEntity<Any> {
        return try {
            // Verificar se o alimento existe no banco
            val foodOptional = foodsRepository.findById(paymentRequest.idFood.toInt())
            if (foodOptional.isEmpty) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(mapOf("error" to "Alimento não encontrado com ID: ${paymentRequest.idFood}"))
            }

            val food = foodOptional.get()

            // Calcular o preço total
            val totalPrice = food.price + paymentRequest.additionalPrice.toFloat()

            // Registrar a venda
            val currentDate = LocalDateTime.now() // Usar LocalDateTime diretamente
            val sale = Sales(
                idfood = paymentRequest.idFood,
                cpf = paymentRequest.cpf,
                datesale = currentDate, // Passar LocalDateTime diretamente
                description = paymentRequest.description,
                price = totalPrice
            )
            val savedSale = salesRepository.save(sale)

            // Responder com sucesso
            ResponseEntity.ok(mapOf("message" to "Pagamento processado com sucesso", "saleId" to savedSale.id))
        } catch (e: Exception) {
            // Tratar erros inesperados
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "Erro ao processar o pagamento: ${e.message}"))
        }
    }

}
