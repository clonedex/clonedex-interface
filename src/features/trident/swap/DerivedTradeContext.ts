import { Currency, CurrencyAmount, Percent, TradeType } from '@clonedex/core-sdk'
import { Trade as LegacyTrade } from '@clonedex/core-sdk/dist/entities/Trade'
import { Trade } from '@clonedex/trident-sdk'
import { createContext, useContext } from 'react'

interface DerivedTradeContext {
  formattedAmounts?: string[]
  trade?:
    | Trade<Currency, Currency, TradeType.EXACT_INPUT | TradeType.EXACT_OUTPUT>
    | LegacyTrade<Currency, Currency, TradeType.EXACT_INPUT | TradeType.EXACT_OUTPUT>
  priceImpact?: Percent
  error?: string
  isWrap?: boolean
  parsedAmounts?: (CurrencyAmount<Currency> | undefined)[]
}

export const DerivedTradeContext = createContext<DerivedTradeContext>({
  formattedAmounts: undefined,
  trade: undefined,
  priceImpact: undefined,
  error: undefined,
  isWrap: undefined,
  parsedAmounts: undefined,
})

export const useDerivedTridentSwapContext = () => useContext(DerivedTradeContext)
