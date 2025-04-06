package com.acteam.app.presentation.screen.card

import androidx.lifecycle.ViewModel
import com.acteam.app.domain.repository.CardRepository

class CardViewModel(
    private val cardRepository: CardRepository
): ViewModel()  {
}