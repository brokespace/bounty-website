export interface CoinGeckoPrice {
  usd: number
  last_updated_at: number
}

export interface CoinGeckoPriceResponse {
  'bitagent-rizzo': CoinGeckoPrice
}

let priceCache: { price: number; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

export async function getSweRizzoPrice(): Promise<number> {
  // Check if we have a valid cached price
  if (priceCache && Date.now() - priceCache.timestamp < CACHE_DURATION) {
    return priceCache.price
  }

  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitagent-rizzo&vs_currencies=usd&include_last_updated_at=true',
      {
        headers: {
          'Accept': 'application/json',
        },
        // Add caching headers
        next: { revalidate: 300 } // 5 minutes
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data: CoinGeckoPriceResponse = await response.json()
    const price = data['bitagent-rizzo']?.usd

    if (typeof price !== 'number') {
      throw new Error('Invalid price data from CoinGecko')
    }

    // Update cache
    priceCache = {
      price,
      timestamp: Date.now()
    }

    return price
  } catch (error) {
    console.error('Failed to fetch bitagent-rizzo price:', error)
    
    // Return cached price if available, even if expired
    if (priceCache) {
      return priceCache.price
    }
    
    // Fallback price if no cache available
    return 0
  }
}

export function formatUSDPrice(alphaAmount: string | number, usdPrice: number): string {
  const alpha = typeof alphaAmount === 'string' ? parseFloat(alphaAmount) : alphaAmount
  if (isNaN(alpha) || usdPrice === 0) {
    return '0.00'
  }

  const usdValue = alpha * usdPrice

  // If input already contains K or M, keep it as is (string only)
  if (typeof alphaAmount === 'string' && /[KM]$/i.test(alphaAmount.trim())) {
    return alphaAmount.trim()
  }

  // Format based on value size
  if (usdValue < 0.01) {
    return '<0.01'
  } else if (usdValue < 1) {
    return `${usdValue.toFixed(3)}`
  } else if (usdValue < 1000) {
    return `${usdValue.toFixed(2)}`
  } else if (usdValue < 1000000) {
    return `${(usdValue / 1000).toFixed(1)}K`
  } else {
    return `${(usdValue / 1000000).toFixed(1)}M`
  }
}