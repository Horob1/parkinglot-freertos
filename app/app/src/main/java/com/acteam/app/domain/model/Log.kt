package com.acteam.app.domain.model

import java.util.Date

data class Log(
    val _id: String,
    val cardId: Card,
    val clientId: Client,
    val isCheckout: Boolean,
    val bill: Int,
    val createdAt: Date,
    val updatedAt: Date
)

data class Card(
    val _id: String,
    val uid: String,
    val createdAt: Date,
    val updatedAt: Date,
    val v: Int
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

data class CarDescription(
    val licensePlate: String,
    val color: String,
    val brand: String,
    val model: String,
    val image: String
)
data class HistoryLog (val _id: String, val cardId: String, val bill: Int?, val createdAt: Date, val updatedAt: Date)
data class CheckLogRequest(val uid: String)
data class CheckLogResponse(val log: Log)
data class HistoryResponse(val logs: List<HistoryLog>)