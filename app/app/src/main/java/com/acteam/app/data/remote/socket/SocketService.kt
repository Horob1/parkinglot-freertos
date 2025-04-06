package com.acteam.app.data.remote.socket

import android.app.Service
import android.content.Intent
import android.os.Binder
import android.os.IBinder
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.acteam.app.domain.model.Slot
import com.google.gson.Gson
import okhttp3.OkHttpClient
import okhttp3.WebSocket
import okhttp3.*
import java.util.concurrent.TimeUnit

class SocketService : Service() {

    private val binder = SocketBinder()
    private var webSocket: WebSocket? = null
    private lateinit var okHttpClient: OkHttpClient

    // LiveData để gửi dữ liệu từ Service đến ViewModel
    private val _slotsLiveData = MutableLiveData<List<Slot>>()
    val slotsLiveData: LiveData<List<Slot>> get() = _slotsLiveData

    override fun onCreate() {
        super.onCreate()

        // Tạo OkHttpClient với WebSocket
        okHttpClient = OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(10, TimeUnit.SECONDS)
            .build()

        val request = Request.Builder()
            .url("ws://10.0.2.2:3600")
            .build()

        webSocket = okHttpClient.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                super.onOpen(webSocket, response)
                val message = mapOf(
                    "type" to "auth",
                    "clientType" to "app"
                )
                val jsonMessage = Gson().toJson(message)
                webSocket.send(jsonMessage)
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                super.onMessage(webSocket, text)

                // Xử lý thông điệp JSON
                val message = Gson().fromJson(text, Message::class.java)

                if (message.type == "update-slots") {
                    // Cập nhật slots vào LiveData
                    _slotsLiveData.postValue(message.slots)
                }
            }

            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                super.onClosing(webSocket, code, reason)
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                super.onFailure(webSocket, t, response)
            }
        })
    }

    override fun onBind(intent: Intent): IBinder? {
        return binder
    }

    override fun onUnbind(intent: Intent?): Boolean {
        return super.onUnbind(intent)
    }

    override fun onDestroy() {
        super.onDestroy()
        webSocket?.close(1000, "Service destroyed")
    }

    // Binder cung cấp phương thức cho Activity
    inner class SocketBinder : Binder() {
        fun getService(): SocketService = this@SocketService
    }
}

data class Message(val type: String, val slots: List<Slot>)
