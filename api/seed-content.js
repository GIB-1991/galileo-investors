import { createClient } from '@supabase/supabase-js';

const ARTICLES = [
  { title: 'ניתוח שוק: מגמות ברבעון הראשון של 2025', summary: 'סקירה מקיפה של מגמות השוק הגלובלי ברבעון הראשון', url: 'https://finance.yahoo.com', category: 'ניתוח שוק', published: true },
  { title: 'כיצד לבנות תיק השקעות מפוזר', summary: 'מדריך מעשי לבניית תיק מפוזר שמפחית סיכונים', url: 'https://www.investopedia.com', category: 'השקעות', published: true },
  { title: 'מניות ערך מול מניות צמיחה', summary: 'השוואה בין שתי אסטרטגיות ההשקעה הפופולריות', url: 'https://www.marketwatch.com', category: 'אסטרטגיה', published: true },
  { title: 'הבנת דוחות כספיים', summary: 'כיצד לקרוא ולנתח דוחות רווח והפסד, מאזן ותזרים', url: 'https://www.wsj.com', category: 'ניתוח בסיסי', published: true },
  { title: 'ריבית דריבית - הנס השמיני של העולם', summary: 'הסבר על כוחה של הריבית דריבית לאורך זמן', url: 'https://www.bloomberg.com', category: 'השקעות', published: true },
  { title: 'ETF מול קרנות נאמנות', summary: 'יתרונות וחסרונות של כל אחד ומתי להשתמש בכל אחד', url: 'https://finance.yahoo.com', category: 'מכשירים פיננסיים', published: true },
];

const ACADEMY = [
  { term: 'P/E Ratio', definition: 'מכפיל הרווח - יחס בין מחיר המניה לרווח למניה. מראה כמה המשקיעים מוכנים לשלם עבור כל שקל רווח.', example: 'אם מניה עולה 100 ₪ ורווח למניה הוא 10 ₪, אזי P/E = 10.', category: 'ניתוח בסיסי', sort_order: 1 },
  { term: 'EPS', definition: 'רווח למניה (Earnings Per Share) - הרווח הנקי של החברה חלקי מספר המניות המונפקות.', example: 'רווח נקי של 10 מיליון ₪ עם מיליון מניות = EPS של 10 ₪.', category: 'ניתוח בסיסי', sort_order: 2 },
  { term: 'ROE', definition: 'תשואה על ההון העצמי (Return on Equity) - מדד לרווחיות החברה ביחס להון העצמי שלה.', example: 'ROE של 15% אומר שהחברה מייצרת 15 ₪ רווח על כל 100 ₪ הון עצמי.', category: 'ניתוח בסיסי', sort_order: 3 },
  { term: 'שוק שורי (Bull Market)', definition: 'תקופה של עליות מחירים מתמשכות בשוק ההון, בדרך כלל הגדרה של עלייה של 20% או יותר.', example: 'שוק שורי בארה"ב בין 2009-2020 היה הארוך ביותר בהיסטוריה.', category: 'מושגי בסיס', sort_order: 4 },
  { term: 'שוק דובי (Bear Market)', definition: 'תקופה של ירידות מחירים מתמשכות בשוק ההון, בדרך כלל ירידה של 20% או יותר.', example: 'שוק דובי קרה במשבר 2008 ובמשבר הקורונה 2020.', category: 'מושגי בסיס', sort_order: 5 },
  { term: 'תשואת דיבידנד', definition: 'הדיבידנד השנתי שמשלמת חברה ביחס למחיר המניה, מבוטא כאחוז.', example: 'מניה עולה 100 ₪ ומשלמת דיבידנד של 5 ₪ = תשואת דיבידנד 5%.', category: 'דיבידנדים', sort_order: 6 },
  { term: 'ביתא (Beta)', definition: 'מדד לתנודתיות מניה ביחס לשוק הכללי. Beta>1 אומר תנודתיות גבוהה מהשוק.', example: 'Beta של 1.5 אומר שהמניה עולה/יורדת 1.5% על כל 1% שינוי בשוק.', category: 'ניהול סיכונים', sort_order: 7 },
  { term: 'מגוון תיק (Diversification)', definition: 'פיזור ההשקעות בין נכסים שונים להפחתת סיכון. "אל תשים את כל הביצים בסל אחד".', example: 'תיק מפוזר כולל מניות, אגרות חוב, נדל"ן וסחורות.', category: 'ניהול סיכונים', sort_order: 8 },
  { term: 'אגרת חוב', definition: 'מכשיר חוב שמנפיקה חברה או ממשלה. המשקיע מלווה כסף ומקבל ריבית קבועה.', example: 'אגרת חוב ממשלתית ל-10 שנים בריבית 4% = תשלום 4% בשנה על ההשקעה.', category: 'מכשירים פיננסיים', sort_order: 9 },
  { term: 'ETF', definition: 'קרן סל הנסחרת בבורסה המחקה מדד או סל נכסים. מאפשרת פיזור בעלות נמוכה.', example: 'SPY הוא ETF שעוקב אחר מדד S&P 500 ומחזיק 500 מניות גדולות בארה"ב.', category: 'מכשירים פיננסיים', sort_order: 10 },
  { term: 'מכירה בחסר (Short Selling)', definition: 'אסטרטגיה שבה משקיע מוכר מניות שאינן שלו (שאלולות) בתקווה לקנות אותן בזול יותר בעתיד.', example: 'מוכר מניה ב-100 ₪, מחיר יורד ל-80 ₪, קונה בחזרה ומרוויח 20 ₪.', category: 'אסטרטגיות', sort_order: 11 },
  { term: 'ניתוח טכני', definition: 'שיטת ניתוח המבוססת על דפוסי מחירים וגרפים לחיזוי תנועות עתידיות של מחירים.', example: 'ממוצע נע, RSI, MACD הם כלים נפוצים בניתוח טכני.', category: 'ניתוח טכני', sort_order: 12 },
];

export default async function handler(req, res) {
  if (req.query.secret !== 'galileo2024seed') {
    return res.status(403).json({ error: 'forbidden' });
  }

  const sb = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );

  // Get auth session from header if provided
  const authHeader = req.headers['x-user-token'];
  if (authHeader) {
    await sb.auth.setSession({ access_token: authHeader, refresh_token: '' });
  }

  const results = {};

  // Try inserting articles
  const { data: artData, error: artErr } = await sb.from('articles').insert(ARTICLES).select('id');
  results.articles = artErr ? { error: artErr.message } : { inserted: artData?.length };

  // Try inserting academy items
  const { data: acData, error: acErr } = await sb.from('academy_items').insert(ACADEMY).select('id');
  results.academy = acErr ? { error: acErr.message } : { inserted: acData?.length };

  res.status(200).json(results);
}