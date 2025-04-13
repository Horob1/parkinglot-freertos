package com.acteam.app.domain.repository

import com.acteam.app.domain.model.Client
import com.acteam.app.domain.model.Log
import com.acteam.app.domain.model.Slot

interface CardRepository {
    suspend fun loadSlotList(): List<Slot>

    suspend fun checkLog(uid: String): Log?

    suspend fun loadHistory(uid: String): List<Log>

    suspend fun checkClient(uid: String): Client?
}