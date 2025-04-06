package com.acteam.app.presentation.screen.card

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.Bundle
import android.os.IBinder
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import com.acteam.app.data.remote.network.RetrofitClient
import com.acteam.app.data.remote.socket.SocketService
import com.acteam.app.domain.model.Log
import com.acteam.app.domain.model.Slot
import com.acteam.app.domain.repository.CardRepositoryImpl
import com.acteam.app.presentation.theme.AppTheme
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.ceil

class CardInfoActivity : ComponentActivity() {
    private var socketService: SocketService? = null
    private var bound = false

    private lateinit var viewModel: CardViewModel

    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            val binder = service as SocketService.SocketBinder
            socketService = binder.getService()
            bound = true

            socketService?.slotsLiveData?.observe(this@CardInfoActivity, Observer { slots ->
                updateSlotUI(slots)
            })
        }

        private fun updateSlotUI(slots: List<Slot>) {
            viewModel.updateSlots(slots)
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            socketService = null
            bound = false
        }
    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val uid = intent.getStringExtra("card_uid") ?: "No UID Found"
        val intent = Intent(this, SocketService::class.java)
        bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE)

        viewModel = ViewModelProvider(
            this,
            CardViewModelFactory(
                CardRepositoryImpl(RetrofitClient.instance),
                uid
            )
        )[CardViewModel::class.java]

        viewModel.isCannotGetLog.observe(this) { isCannotGetLog ->

            if(isCannotGetLog) {
                Toast.makeText(this, "Card invalid!", Toast.LENGTH_SHORT).show()
                finish()
            }
        }
        enableEdgeToEdge()
        setContent {
            AppTheme {
                Scaffold (modifier = Modifier.fillMaxSize()) { innerPadding ->
                    CardInfoScreen(uid, modifier = Modifier.padding(innerPadding), viewModel)
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        if (bound) {
            unbindService(serviceConnection)
            bound = false
        }
    }
}

@Composable
fun CardInfoScreen(uid: String, modifier: Modifier = Modifier, viewModel: CardViewModel) {
    // Collecting data from the viewModel
    val slotList = viewModel.slotList.collectAsState()
    val log = viewModel.log.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        // LazyColumn to display slots
        LazyColumn(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            item {
                BankCardUI(uid = uid, log = log.value)
            }
            items(slotList.value.size) { index ->
                SlotItem(slot = slotList.value[index])
            }
        }
    }
}

fun calculateBill(createdAt: Date): Int {
    val now = Date()
    val diffMillis = now.time - createdAt.time

    // Chuyển millis → giờ (double), rồi làm tròn lên
    val hours = ceil(diffMillis / (1000.0 * 60 * 60))

    // Nhân với 10,000
    return (hours * 10_000).toInt()
}

fun formatDate(date: Date): String {
    val formatter = SimpleDateFormat("dd/MM/yy HH:mm", Locale.getDefault())
    return formatter.format(date)
}

@Composable
fun BankCardUI(uid: String, log: Log, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(8.dp),
        shape = RoundedCornerShape(16.dp),

    ) {
        // Add a gradient background for the bank card look
        Box(
            modifier = Modifier
                .background(Brush.horizontalGradient(listOf(
                    MaterialTheme.colorScheme.primary,
                    MaterialTheme.colorScheme.secondary
                ))) // Green to blue gradient
        ) {
            Column(
                modifier = Modifier
                    .padding(24.dp)
                    .fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "Card UID",
                    style = MaterialTheme.typography.bodyMedium.copy(
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp
                    ),
                    modifier = Modifier.align(Alignment.Start)
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = uid,
                    style = MaterialTheme.typography.bodyMedium.copy(
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 24.sp
                    ),
                )
                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Check-In ⏳: ${formatDate(log.createdAt)}",
                    style = MaterialTheme.typography.bodyMedium.copy(
                        color = Color.White,
                        fontWeight = FontWeight.Medium,
                        fontSize = 18.sp
                    ),
                    modifier = Modifier.align(Alignment.Start)
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Bill 💰: ${calculateBill(
                        log.createdAt
                    )} VND",
                    style = MaterialTheme.typography.bodyMedium.copy(
                        color = Color.White,
                        fontWeight = FontWeight.Medium,
                        fontSize = 18.sp
                ),
                    modifier = Modifier.align(Alignment.Start)
                )
            }
        }
    }
}

@Composable
fun SlotItem(slot: Slot) {
    val color by animateColorAsState(
        targetValue = if (slot.isEmpty) Color(0xFF4CAF50) else Color(0xFFF44336), // xanh / đỏ
        label = ""
    )

    val formattedTime = remember(slot.updatedAt) {
        SimpleDateFormat("d/M/yyyy, hh:mm:ss a", Locale.getDefault()).format(slot.updatedAt)
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
            .aspectRatio(1f), // Hình vuông
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = color)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // Slot number in the center
            Text(
                text = slot.number.toString(),
                style = MaterialTheme.typography.displayLarge.copy(
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                ),
                modifier = Modifier.align(Alignment.Center)
            )

            // Time at bottom-end
            Text(
                text = "Updated At $formattedTime",
                style = MaterialTheme.typography.labelSmall.copy(color = Color.White),
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(end = 4.dp, bottom = 4.dp)
            )
        }
    }
}
