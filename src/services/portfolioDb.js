import { supabase } from './supabase.js'

export async function loadHoldingsFromDB(userId) {
  const { data, error } = await supabase
    .from('portfolio_holdings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) { console.error('loadHoldings:', error); return [] }
  return data.map(r => ({
    id: r.id, ticker: r.ticker, name: r.name || r.ticker,
    shares: parseFloat(r.shares), buyPrice: parseFloat(r.buy_price)
  }))
}

export async function saveHoldingToDB(userId, holding) {
  const { data, error } = await supabase.from('portfolio_holdings').insert({
    user_id: userId, ticker: holding.ticker, name: holding.name,
    shares: holding.shares, buy_price: holding.buyPrice
  }).select().single()
  if (error) { console.error('saveHolding:', error); return null }
  return { ...holding, id: data.id }
}

export async function updateHoldingInDB(id, shares) {
  const { error } = await supabase.from('portfolio_holdings')
    .update({ shares }).eq('id', id)
  if (error) console.error('updateHolding:', error)
}

export async function deleteHoldingFromDB(id) {
  const { error } = await supabase.from('portfolio_holdings').delete().eq('id', id)
  if (error) console.error('deleteHolding:', error)
}

export async function loadHistoryFromDB(userId) {
  const { data, error } = await supabase
    .from('trade_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) { console.error('loadHistory:', error); return [] }
  return data.map(r => ({
    id: r.id, type: r.type, ticker: r.ticker, name: r.name || r.ticker,
    shares: parseFloat(r.shares), price: parseFloat(r.price),
    buyPrice: r.buy_price ? parseFloat(r.buy_price) : null,
    date: r.trade_date || new Date(r.created_at).toLocaleDateString('he-IL'),
    ts: new Date(r.created_at).getTime()
  }))
}

export async function saveTradeHistoryToDB(userId, entry) {
  const { error } = await supabase.from('trade_history').insert({
    user_id: userId, type: entry.type, ticker: entry.ticker,
    name: entry.name, shares: entry.shares, price: entry.price,
    buy_price: entry.buyPrice, trade_date: entry.date
  })
  if (error) console.error('saveHistory:', error)
}
