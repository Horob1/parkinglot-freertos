package com.acteam.app.domain.repository

import com.acteam.app.data.remote.api.ApiService
import com.acteam.app.domain.model.CarDescription
import com.acteam.app.domain.model.Card
import com.acteam.app.domain.model.CheckLogRequest
import com.acteam.app.domain.model.Client
import com.acteam.app.domain.model.HistoryLog
import com.acteam.app.domain.model.Log
import com.acteam.app.domain.model.Slot
import java.util.Date

class CardRepositoryImpl(private  val apiService: ApiService) : CardRepository  {
    override suspend fun loadSlotList(): List<Slot> {
        return try {
            apiService.getAllSlots()
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    override suspend fun checkLog(uid: String): Log? {
        return try {
            val request = CheckLogRequest(uid)
            apiService.checkLog(request).log
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    override suspend fun loadHistory(uid: String): List<HistoryLog> {
        try {
            val res = apiService.getAllLogs(uid)
            return res.logs.filter { it.bill != null }
        } catch (e: Exception) {
            e.printStackTrace()
            return emptyList()
        }
    }

}