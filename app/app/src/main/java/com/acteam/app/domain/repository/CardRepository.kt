package com.acteam.app.domain.repository

import com.acteam.app.domain.model.Log
import com.acteam.app.domain.model.Slot

interface CardRepository {
    suspend fun loadSlotList(): List<Slot>

    suspend fun checkLog(uid: String): Log

}