package com.acteam.app.presentation.screen.card

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.acteam.app.domain.model.Client
import com.acteam.app.domain.model.Log
import com.acteam.app.domain.model.Slot
import com.acteam.app.domain.repository.CardRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch

class CardViewModel(
    private val cardRepository: CardRepository,
    val uid: String
): ViewModel()  {

    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading

    private val _isError = MutableLiveData(false)
    val isError: MutableLiveData<Boolean> = _isError

    private val _slotList = MutableStateFlow<List<Slot>>(emptyList())
    val slotList = _slotList

    private val _historyList = MutableStateFlow<List<Log>>(emptyList())
    val historyList = _historyList

    private val _client = MutableStateFlow<Client?>(null)
    val client = _client

    private val _log = MutableStateFlow<Log?>(null)
    val log = _log

    init {
        _isLoading.value = true

        loadSlotList()
        checkLog()
        loadHistory()
        checkClient()

        _isLoading.value = false
    }

    private fun loadSlotList() {
        viewModelScope.launch {
            val slotList = cardRepository.loadSlotList()
            _slotList.value = slotList
        }
    }

    private fun checkLog() {
        viewModelScope.launch {
            val log = cardRepository.checkLog(uid)
            _log.value = log
        }
    }

    private fun loadHistory() {
        viewModelScope.launch {
            val historyList = cardRepository.loadHistory(uid)
            _historyList.value = historyList
        }
    }

    private fun checkClient() {
        viewModelScope.launch {
            val client = cardRepository.checkClient(uid)
            if (client == null) {
                _isError.value = true
            }
            _client.value = client
        }
    }

    fun reload() {
        _isLoading.value = true

        checkLog()
        loadHistory()

        _isLoading.value = false

    }

    fun updateSlots(slots: List<Slot>) {
        _slotList.value = slots
    }

}