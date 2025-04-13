package com.acteam.app.domain.model

import java.util.Date

data class CarDescription(
    val licensePlate: String,
    val color: String,
    val brand: String,
    val model: String,
    val image: String
)
data class Client(
    val _id: String,
    val cccd: String,
    val avatar: String,
    val name: String,
    val phone: String,
    val email: String,
    val cardId: String,
    val address: String,
    val carDescription: CarDescription,
    val createdAt: Date,
    val updatedAt: Date,
    val v: Int
)

data class CheckClientRequest(
    val uid: String
)

data class CheckClientResponse(
    val client: Client,
    val message: String
)