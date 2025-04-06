package com.acteam.app.data.remote.api

import com.acteam.app.domain.model.CheckLogRequest
import com.acteam.app.domain.model.Log
import com.acteam.app.domain.model.Slot
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface ApiService {
    @POST("/api/log/check")
    suspend fun checkLog(@Body request: CheckLogRequest): Log

    @GET("/api/slot")
    suspend fun getAllSlots(): List<Slot>
}
