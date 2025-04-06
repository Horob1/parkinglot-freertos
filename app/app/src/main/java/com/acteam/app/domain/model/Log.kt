package com.acteam.app.domain.model

import java.util.Date

data class Log (val _id: String, val cardId: String, val bill: Int?, val createdAt: Date, val updatedAt: Date)

data class CheckLogRequest(val uid: String)