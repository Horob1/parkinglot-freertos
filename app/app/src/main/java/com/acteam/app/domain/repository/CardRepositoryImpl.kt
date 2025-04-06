package com.acteam.app.domain.repository

import com.acteam.app.data.remote.api.ApiService
import com.acteam.app.domain.model.CheckLogRequest
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

    override suspend fun checkLog(uid: String): Log {
        return try {
            val request = CheckLogRequest(uid)
            apiService.checkLog(request)
        } catch (e: Exception) {
            e.printStackTrace()
            Log("", "", null, Date(), Date())
        } as Log
    }
}