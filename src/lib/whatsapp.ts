const EDGE_FN_URL = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/send-whatsapp`;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_KEY || '';
const WA_ENABLED = process.env.REACT_APP_WHATSAPP_ENABLED === 'true';

export function sendWAMessage(phone: string, message: string): void {
  if (WA_ENABLED) {
    fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ phone, message }),
    }).catch(() => {
      window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, '_blank');
    });
  } else {
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, '_blank');
  }
}
