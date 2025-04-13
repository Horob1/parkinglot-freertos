package com.acteam.app.presentation.screen.card

import android.content.ComponentName
import android.content.Intent
import android.content.ServiceConnection
import android.os.Bundle
import android.os.IBinder
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material.pullrefresh.PullRefreshIndicator
import androidx.compose.material.pullrefresh.pullRefresh
import androidx.compose.material.pullrefresh.rememberPullRefreshState
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.acteam.app.R
import com.acteam.app.data.remote.network.RetrofitClient
import com.acteam.app.data.remote.socket.SocketService
import com.acteam.app.domain.model.Client
import com.acteam.app.domain.model.Log
import com.acteam.app.domain.model.Slot
import com.acteam.app.domain.repository.CardRepositoryImpl
import com.acteam.app.presentation.theme.AppTheme
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale


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
        bindService(intent, serviceConnection, BIND_AUTO_CREATE)

        viewModel = ViewModelProvider(
            this,
            CardViewModelFactory(
                CardRepositoryImpl(RetrofitClient.instance),
                uid
            )
        )[CardViewModel::class.java]

        viewModel.isError.observe(this) { isError ->
            if (isError) finish()
        }
        enableEdgeToEdge()
        setContent {
            AppTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
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

@OptIn(ExperimentalMaterial3Api::class, ExperimentalMaterialApi::class)
@Composable
fun CardInfoScreen(
    uid: String,
    modifier: Modifier = Modifier,
    viewModel: CardViewModel
) {
    val isLoading by viewModel.isLoading.collectAsState()
    val client by viewModel.client.collectAsState()
    val log by viewModel.log.collectAsState()
    val slotList by viewModel.slotList.collectAsState()
    val logHistory by viewModel.historyList.collectAsState()

    val pullRefreshState = rememberPullRefreshState(
        refreshing = isLoading,
        onRefresh = {
            viewModel.reload()
        }
    )

    var showHistory by remember { mutableStateOf(false) }
    if (isLoading || client == null) LoadingScreen()
    else
        Box(
            modifier = Modifier
                .fillMaxSize()
                .pullRefresh(pullRefreshState)
        ) {
            LazyColumn(
                modifier = modifier
                    .padding(horizontal = 16.dp)
                    .fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {

                item {
                    BankCardUI(
                        uid = uid,
                        log = log,
                        client = client!!,
                        totalBill = logHistory.sumOf {
                            it.bill ?: 0
                        })
                }

                if (log != null) item {
                    HistoryItem(log = log!!)
                }
                
                if (logHistory.isNotEmpty()) {
                    item {
                        Button(
                            onClick = { showHistory = !showHistory },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(if (showHistory) "Hide History" else "Show History")
                        }
                    }

                    item {
                        AnimatedVisibility(
                            visible = showHistory,
                            enter = expandVertically() + fadeIn(),
                            exit = shrinkVertically() + fadeOut()
                        ) {
                            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                logHistory.forEach { log -> HistoryItem(log = log) }
                            }
                        }
                    }
                }

                items(slotList.size) { index ->
                    SlotItem(slot = slotList[index])
                }
            }
            PullRefreshIndicator(
                refreshing = isLoading,
                state = pullRefreshState,
                modifier = Modifier.align(Alignment.TopCenter)
            )
        }
}

@Composable
fun LoadingScreen() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator(
            color = MaterialTheme.colorScheme.primary,
            strokeWidth = 4.dp
        )
    }
}

@Composable
fun HistoryItem(log: Log) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "⏱️ Check-In: ${formatDate(log.createdAt)}",
                style = MaterialTheme.typography.bodyMedium
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "⏱️ Check-Out: ${formatDate(log.updatedAt)}",
                style = MaterialTheme.typography.bodyMedium
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "💰 Bill: ${log.bill} VND",
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}

fun formatDate(date: Date?): String {
    val formatter = SimpleDateFormat("dd/MM/yy HH:mm", Locale.getDefault())
    return formatter.format(date ?: Date())
}

@Composable
fun BankCardUI(
    uid: String,
    log: Log?,
    client: Client,
    totalBill: Int,
    modifier: Modifier = Modifier
) {
    var flipped by remember { mutableStateOf(false) }

    val rotation by animateFloatAsState(
        targetValue = if (flipped) 180f else 0f,
        animationSpec = tween(durationMillis = 600),
        label = "flipRotation"
    )

    val isFront = rotation <= 90f

    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(top = 12.dp)
            .height(200.dp)
            .graphicsLayer {
                rotationY = rotation
                cameraDistance = 12 * density
            }
            .clickable { flipped = !flipped }
    ) {
        if (isFront) {
            FrontCardContent(uid = uid, log = log, client = client, totalBill = totalBill)
        } else {
            BackCardContent(client = client)
        }
    }
}

@Composable
fun FrontCardContent(uid: String, log: Log?, client: Client, totalBill: Int) {
    Card(
        modifier = Modifier.fillMaxSize(),
        shape = RoundedCornerShape(20.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Box(
            modifier = Modifier
                .background(
                    Brush.linearGradient(
                        listOf(
                            MaterialTheme.colorScheme.primaryContainer,
                            MaterialTheme.colorScheme.primary
                        )
                    )
                )
                .padding(24.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxSize(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        "CARD UID",
                        style = MaterialTheme.typography.labelLarge.copy(color = Color.White)
                    )
                    Text(
                        text = uid,
                        style = MaterialTheme.typography.headlineSmall.copy(
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    )
                    if (log != null) {
                        Spacer(Modifier.height(8.dp))
                        Text(
                            "Check-In ⏳: ${formatDate(log.createdAt)}",
                            style = MaterialTheme.typography.bodyMedium.copy(color = Color.White)
                        )
                        Spacer(Modifier.height(8.dp))
                        Text(
                            "Bill 💰: ${log.bill} VND (Estimate)",
                            style = MaterialTheme.typography.bodyMedium.copy(color = Color.White)
                        )
                    }

                    Spacer(Modifier.height(8.dp))
                    Text(
                        "Total Bill 💰: $totalBill VND",
                        style = MaterialTheme.typography.bodyMedium.copy(color = Color.White)
                    )
                }

                Spacer(Modifier.width(16.dp))

                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    AsyncImage(
                        model = ImageRequest.Builder(LocalContext.current)
                            .data("https://parkinglot-freertos.onrender.com${client.avatar}")
                            .crossfade(true)
                            .build(),
                        contentDescription = "Avatar",
                        modifier = Modifier
                            .size(64.dp)
                            .clip(CircleShape)
                            .border(2.dp, Color.White, CircleShape),
                        contentScale = ContentScale.Crop,
                    )
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = client.name,
                        style = MaterialTheme.typography.labelLarge.copy(color = Color.White),
                        textAlign = TextAlign.Center
                    )
                }
            }
        }
    }
}

@Composable
fun BackCardContent(client: Client) {
    Card(
        modifier = Modifier.fillMaxSize(),
        shape = RoundedCornerShape(20.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondary)
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier.fillMaxSize()
        ) {
            AsyncImage(
                model = ImageRequest.Builder(LocalContext.current)
                    .data("https://parkinglot-freertos.onrender.com${client.carDescription.image}")
                    .crossfade(true)
                    .build(),
                contentDescription = "car",
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
                placeholder = painterResource(id = R.drawable.lambo), // ảnh tạm thời khi loading (nếu có)
                error = painterResource(id = R.drawable.lambo), // ảnh khi load lỗi (nếu có)
                fallback = painterResource(id = R.drawable.lambo)
            )
        }
    }
}


@Composable
fun SlotItem(slot: Slot) {
    val color by animateColorAsState(
        targetValue = if (slot.isEmpty) Color(0xFF4CAF50) else Color(0xFFF44336),
        label = "slotColorAnimation"
    )

    val formattedTime = remember(slot.updatedAt) {
        SimpleDateFormat("d/M/yyyy, hh:mm:ss a", Locale.getDefault()).format(slot.updatedAt)
    }

    ElevatedCard(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(1f), // Hình vuông
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = color)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            Text(
                text = slot.number.toString(),
                style = MaterialTheme.typography.displayMedium.copy(
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 180.sp
                ),
                modifier = Modifier.align(Alignment.Center)
            )
            Text(
                text = "Updated: $formattedTime",
                style = MaterialTheme.typography.labelSmall.copy(
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                ),
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(end = 4.dp, bottom = 4.dp)
            )
        }
    }
}