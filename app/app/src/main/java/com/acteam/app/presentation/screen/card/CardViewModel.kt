package com.acteam.app.presentation.screen.card

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.acteam.app.domain.model.Log
import com.acteam.app.domain.model.Slot
import com.acteam.app.domain.repository.CardRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch
import java.util.Date

class CardViewModel(
    private val cardRepository: CardRepository,
    val uid: String
): ViewModel()  {
    private val _isCannotGetLog = MutableLiveData(false)
    val isCannotGetLog = _isCannotGetLog

    private val _slotList = MutableStateFlow<List<Slot>>(emptyList())
    val slotList = _slotList

    private val _log = MutableStateFlow<Log>(Log("", "", null, Date(), Date()))
    val log = _log

    fun loadSlotList() {
        viewModelScope.launch {
            val slotList = cardRepository.loadSlotList()
            _slotList.value = slotList
        }
    }

    private fun checkLog() {
        viewModelScope.launch {
            val log = cardRepository.checkLog(uid)
            _log.value = log
            _isCannotGetLog.value = log._id == ""
        }
    }

    fun updateSlots(newSlots: List<Slot>) {
        _slotList.value = newSlots
    }

    init {
        checkLog()
        loadSlotList()
    }
}