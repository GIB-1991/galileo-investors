import { create } from 'zustand'
import { supabase } from '../services/supabase.js'
import { getStockQuote } from '../services/stockApi.js'
export const usePortfolioStore = create((set,get) => ({
  holdings:[],stockData:{},loading:false,error:null,
  loadPortfolio: async (userId) => {
    set({loading:true})
    const {data,error} = await supabase.from('portfolio_holdings').select('*').eq('user_id',userId).order('created_at',{ascending:true})
    if(error){set({error:error.message,loading:false});return}
    const holdings=data||[];set({holdings,loading:false})
    for(const h of holdings){const quote=await getStockQuote(h.ticker);const cv=quote.price*h.shares;set(s=>({stockData:{...s.stockData,[h.ticker]:quote},holdings:s.holdings.map(x=>x.id===h.id?{...x,currentPrice:quote.price,currentValue:cv,totalCost:h.buy_price*h.shares}:x)}))}
  },
  addHolding: async (userId,ticker,shares,buyPrice) => {
    const quote=await getStockQuote(ticker);const cv=quote.price*shares;const tc=buyPrice*shares
    const {data,error} = await supabase.from('portfolio_holdings').insert({user_id:userId,ticker:ticker.toUpperCase(),shares:parseFloat(shares),buy_price:parseFloat(buyPrice)}).select().single()
    if(error){set({error:error.message});return{error}}
    set(s=>({holdings:[...s.holdings,{...data,currentPrice:quote.price,currentValue:cv,totalCost:tc}],stockData:{...s.stockData,[ticker.toUpperCase()]:quote}}))
    return{data}
  },
  removeHolding: async (id) => {
    await supabase.from('portfolio_holdings').delete().eq('id',id)
    set(s=>({holdings:s.holdings.filter(h=>h.id!==id)}))
  },
  clearError: () => set({error:null})
}))