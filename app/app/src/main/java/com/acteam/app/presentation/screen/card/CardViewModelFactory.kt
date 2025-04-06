package com.acteam.app.presentation.screen.card

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.acteam.app.domain.repository.CardRepository


@Suppress("UNCHECKED_CAST")
class CardViewModelFactory(private val cardRepository: CardRepository, private val uid: String) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(CardViewModel::class.java)) {
            return CardViewModel(cardRepository, uid) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
