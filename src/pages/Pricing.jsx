import { useNavigate } from 'react-router-dom'
import { Check, Sparkles, Crown, Calendar } from 'lucide-react'
import { supabase } from '../services/supabase.js'
import { useAccess } from '../hooks/useAccess.js'

const PLANS = [
  {
    id: 'trial',
    name: 'ניסיון חינם',
    price: '0',
    period: '7 ימים',
    icon: Sparkles,
    color: '#2dd87a',
    features: [
      'גישה מלאה לכל הפיצ\'רים',
      'בניית תיק השקעות',
      'סקרינר מניות מתקדם',
      'מאמרים ואקדמיה',
      'נתוני שוק בזמן אמת',
      'מעקב אחר משקיעים גדולים',
    ],
    cta: 'התחל ניסיון',
    note: 'ללא צורך בכרטיס אשראי'
  },
  {
    id: 'monthly',
    name: 'חודשי',
    price: '19',
    period: 'לחודש',
    icon: Calendar,
    color: '#f5a623',
    features: [
      'כל הפיצ\'רים של מסלול הניסיון',
      'ללא הגבלת זמן',
      'תמיכה במייל',
      'עדכונים שוטפים',
      'גישה מכל מכשיר',
      'ביטול בכל עת',
    ],
    cta: 'הירשם חודשי',
    popular: false
  },
  {
    id: 'yearly',
    name: 'שנתי',
    price: '120',
    period: 'לשנה',
    icon: Crown,
    color: '#a855f7',
    features: [
      'כל הפיצ\'רים של המסלול החודשי',
      'חיסכון של 47% בהשוואה לחודשי',
      'רק 10₪ לחודש',
      'תמיכה מועדפת',
      'גישה מוקדמת לפיצ\'רים חדשים',
      'אפשרות להחזר עד 30 יום',
    ],
    cta: 'הירשם שנתי',
    popular: true,
    saveLabel: 'מומלץ · חיסכון 47%'
  }
]

export default function Pricing({ user }) {
  const navigate = useNavigate()
  const access = useAccess(user)

  async function selectPlan(planId) {
    if (!user) { navigate('/auth'); return }
    if (planId === 'trial') {
      // Already on trial — redirect to dashboard
      navigate('/dashboard')
      return
    }
    // For paid plans — placeholder. Real payment integration would go here.
    alert('תשלום בפיתוח. כרגע אפשר להמשיך עם ניסיון חינם או לפנות במייל לשדרוג ידני.')
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 .8rem', background: 'linear-gradient(135deg,#f5a623,#ff8a4c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>בחר את המסלול שלך</h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', margin: 0 }}>גישה מלאה לפלטפורמת ההשקעות המובילה לישראלים</p>
        {user && access.plan === 'trial' && !access.expired && (
          <div style={{ display: 'inline-block', marginTop: '1rem', padding: '8px 16px', background: 'rgba(45,216,122,.12)', border: '1px solid rgba(45,216,122,.3)', borderRadius: 20, fontSize: '.85rem', color: '#2dd87a', fontWeight: 600 }}>
            הניסיון שלך פעיל · {access.daysLeft} ימים נותרו
          </div>
        )}
        {user && access.expired && (
          <div style={{ display: 'inline-block', marginTop: '1rem', padding: '8px 16px', background: 'rgba(240,82,82,.1)', border: '1px solid rgba(240,82,82,.3)', borderRadius: 20, fontSize: '.85rem', color: '#f05252', fontWeight: 600 }}>
            תקופת הניסיון הסתיימה · בחר מסלול להמשך
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {PLANS.map(plan => {
          const Icon = plan.icon
          return (
            <div key={plan.id} style={{
              position: 'relative',
              background: 'var(--color-surface)',
              border: '1px solid ' + (plan.popular ? plan.color : 'var(--color-border)'),
              borderRadius: 16,
              padding: '2rem 1.5rem',
              boxShadow: plan.popular ? '0 8px 32px ' + plan.color + '20' : '0 2px 8px rgba(0,0,0,.04)',
              transition: 'transform .15s, box-shadow .15s'
            }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: -12, insetInlineStart: '50%', transform: 'translateX(50%)', background: plan.color, color: '#0d0f14', padding: '4px 14px', borderRadius: 20, fontSize: '.72rem', fontWeight: 700 }}>
                  {plan.saveLabel}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.2rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: plan.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: plan.color }}>
                  <Icon size={22} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>{plan.name}</h3>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2.6rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>₪{plan.price}</span>
                <span style={{ fontSize: '.9rem', color: 'var(--color-text-muted)', marginInlineStart: 8 }}>{plan.period}</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                    <Check size={15} style={{ color: plan.color, flexShrink: 0, marginTop: 2 }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button onClick={() => selectPlan(plan.id)} style={{
                width: '100%',
                padding: '12px',
                borderRadius: 10,
                border: plan.popular ? 'none' : '1px solid var(--color-border)',
                background: plan.popular ? plan.color : 'var(--color-bg2)',
                color: plan.popular ? '#0d0f14' : 'var(--color-text-primary)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '.95rem'
              }}>{plan.cta}</button>

              {plan.note && (
                <p style={{ fontSize: '.72rem', color: 'var(--color-text-muted)', textAlign: 'center', margin: '10px 0 0' }}>{plan.note}</p>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '.85rem' }}>
        שאלות? צרו קשר ב-gilbitan2000@gmail.com
      </div>
    </div>
  )
}
