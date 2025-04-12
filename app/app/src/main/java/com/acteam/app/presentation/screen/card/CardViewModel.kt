package com.acteam.app.presentation.screen.card

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.acteam.app.domain.model.HistoryLog
import com.acteam.app.domain.model.Log
import com.acteam.app.domain.model.Slot
import com.acteam.app.domain.repository.CardRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch

class CardViewModel(
    private val cardRepository: CardRepository,
    val uid: String
): ViewModel()  {
    private val _isLoading = MutableStateFlow(true)
    val isLoading = _isLoading

    private val _isCannotGetLog = MutableStateFlow(false)
    val isCannotGetLog = _isCannotGetLog

    private val _slotList = MutableStateFlow<List<Slot>>(emptyList())
    val slotList = _slotList

    private val _log = MutableStateFlow<Log?>(null)
    val log = _log

    private val _history = MutableStateFlow<List<HistoryLog>>(emptyList())
    val history = _history

    fun loadHistory() {
        viewModelScope.launch {
            val history = cardRepository.loadHistory(uid)
            _history.value = history
        }
    }

    fun loadSlotList() {
        viewModelScope.launch {
            val slotList = cardRepository.loadSlotList()
            _slotList.value = slotList.sortedBy {
                it.number
            }
        }
    }

    private fun checkLog() {
        viewModelScope.launch {
            val log = cardRepository.checkLog(uid)
            if (log == null) _isCannotGetLog.value = true
            else _log.value = log

        }
    }

    fun updateSlots(newSlots: List<Slot>) {
        _slotList.value = newSlots.sortedBy { it.number }
    }

    init {
        _isLoading.value = true
        checkLog()
        loadSlotList()
        loadHistory()
        _isLoading.value = false
    }
}