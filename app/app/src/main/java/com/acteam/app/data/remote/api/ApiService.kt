package com.acteam.app.data.remote.api

import com.acteam.app.domain.model.CheckLogRequest
import com.acteam.app.domain.model.CheckLogResponse
import com.acteam.app.domain.model.HistoryResponse
import com.acteam.app.domain.model.Log
import com.acteam.app.domain.model.Slot
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface ApiService {
    @POST("/api/log/check")
    suspend fun checkLog(@Body request: CheckLogRequest): CheckLogResponse

    @GET("/api/slot")
    suspend fun getAllSlots(): List<Slot>

    @GET("/api/log/history/{uid}")
    suspend fun getAllLogs(@Path("uid") uid: String): HistoryResponse
}
