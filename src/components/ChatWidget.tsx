import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, ChevronDown } from 'lucide-react';
import { fetchSettings } from '../lib/settingsApi';
import { supabase } from '../lib/supabaseApi';

import { t as tr, useLanguage } from '@/i18n';


// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string | number;
  from: 'bot' | 'user' | 'admin';
  text: string;
  created_at?: string;
}

// ─── Session ID (ثابت در طول یک session مرورگر) ──────────────────────────────

function getSessionId(): string {
  const key = 'cn_chat_sid';
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = `guest-${Math.random().toString(36).slice(2)}-${Date.now()}`;
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

// ─── Bot replies (fallback هنگامی که ادمین آفلاین است) ───────────────────────

const DEFAULT_QUICK_REPLIES = [tr("خدمات VC-Ready سازی"), tr("نحوه همکاری"), tr("تماس با تیم")];

function botReply(userText: string): string {
  const t = userText.toLowerCase();
  if (t.includes('vc-ready') || t.includes(tr("آماده‌سازی")) || t.includes(tr("خدمات")))
    return tr("سرویس VC-Ready سازی شامل آماده‌سازی Pitch Deck، مدل مالی و روایت سرمایه‌گذاری است. برای مشاوره رایگان صفحه خدمات را ببینید.");
  if (t.includes(tr("نحوه")) || t.includes(tr("همکاری")) || t.includes(tr("چطور")))
    return tr("فرایند همکاری ما در ۳ مرحله است: ارزیابی اولیه → آماده‌سازی پرونده → معرفی هدفمند به VC. صفحه فرایند را مطالعه کنید.");
  if (t.includes(tr("تماس")) || t.includes(tr("تیم")))
    return tr("می‌توانید از طریق صفحه تماس فرم پر کنید یا مستقیم به ایمیل hello@capnet.io پیام بدهید.");
  if (t.includes(tr("قیمت")) || t.includes(tr("هزینه")))
    return tr("هزینه‌ها بر اساس مرحله استارتاپ و نوع سرویس متفاوت است. جهت دریافت پیش‌فاکتور با تیم ما تماس بگیرید.");
  return tr("ممنون از سؤالتان! تیم ما به زودی پاسخ می‌دهد. همچنین می‌توانید صفحه تماس را پر کنید.");
}

// ─── INITIAL messages ─────────────────────────────────────────────────────────

// پیام خوش‌آمدگویی باید هنگام استفاده (نه هنگام بارگذاری ماژول) ترجمه شود،
// تا با تغییر زبان به‌روزرسانی گردد.
function createInitialMessages(): Message[] {
  return [
    {
      id: 1,
      from: 'bot',
      text: tr("سلام! 👋 به CapNet خوش آمدید.\nچطور می‌توانم در مسیر جذب سرمایه کمکتان کنم؟"),
    },
  ];
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChatWidget() {
  const { lang } = useLanguage();
  const [chatEnabled, setChatEnabled] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(createInitialMessages);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(1);

  // با تغییر زبان، پیام خوش‌آمدگویی دوباره ترجمه می‌شود
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 0 || prev[0].from !== 'bot') return prev;
      const [welcome] = createInitialMessages();
      if (prev[0].text === welcome.text) return prev;
      return [welcome, ...prev.slice(1)];
    });
  }, [lang]);
  const [quickReplies, setQuickReplies] = useState<string[]>(DEFAULT_QUICK_REPLIES);
  const [roomId, setRoomId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionId = getSessionId();

  // load chat icon enabled flag from site_settings + realtime updates
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const { data } = await (supabase as any)
          .from('site_settings')
          .select('value')
          .eq('key', 'chat_icon_enabled')
          .maybeSingle();
        if (!mounted) return;
        const val = data?.value;
        if (val === undefined || val === null) setChatEnabled(true);
        else setChatEnabled(val === true || val === 'true');
      } catch {
        if (mounted) setChatEnabled(true);
      }
    };

    load();

    // تغییر آنی بدون reload: ادمین toggle می‌زند → سایت بلافاصله آپدیت می‌شود
    const channel = (supabase as any)
      .channel('chat-icon-setting')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings', filter: 'key=eq.chat_icon_enabled' },
        (payload: any) => {
          if (!mounted) return;
          const val = payload.new?.value;
          if (val === undefined || val === null) setChatEnabled(true);
          else setChatEnabled(val === true || val === 'true');
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      (supabase as any).removeChannel(channel);
    };
  }, []);

  // fetch quick replies از DB settings
  useEffect(() => {
    fetchSettings().then(s => {
      if (s.chat_quick_replies?.length > 0) setQuickReplies(s.chat_quick_replies);
    }).catch(() => {});
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  // ── اتصال به chat room و دریافت پیام‌های ادمین ─────────────────────────────
  const setupRealtime = useCallback(async (rId: string) => {
    const channel = supabase
      .channel(`chat-room-${rId}`)
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${rId}`,
        },
        (payload: any) => {
          const msg = payload.new;
          // فقط پیام‌های ادمین را نمایش بده
          if (msg.sender_type === 'admin') {
            setMessages(prev => [...prev, {
              id: msg.id,
              from: 'admin' as const,
              text: msg.message || '',
              created_at: msg.created_at,
            }]);
            if (!open) setUnread(n => n + 1);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [open]);

  // ── load تاریخچه پیام‌های یک room از DB ─────────────────────────────────────
  const loadHistory = useCallback(async (rId: string) => {
    const { data } = await (supabase as any)
      .from('chat_messages')
      .select('id, sender_type, message, created_at')
      .eq('room_id', rId)
      .order('created_at', { ascending: true });

    if (!data?.length) return;

    const history: Message[] = (data as Array<{ id: string; sender_type: string; message: string; created_at: string }>)
      .map(m => ({
        id: m.id,
        from: (m.sender_type === 'admin' ? 'admin' : m.sender_type === 'bot' ? 'bot' : 'user') as Message['from'],
        text: m.message,
        created_at: m.created_at,
      }));

    setMessages([...createInitialMessages(), ...history]);
  }, []);

  // ── پیدا کردن یا ساختن chat room (بر اساس session_id) ──────────────────────
  const getOrCreateRoom = useCallback(async (): Promise<string | null> => {
    if (roomId) return roomId;

    // ابتدا اتاق همین session را پیدا کن
    const { data: existing } = await (supabase as any)
      .from('chat_rooms')
      .select('id')
      .eq('session_id', sessionId)
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      setRoomId(existing.id);
      await loadHistory(existing.id);
      setupRealtime(existing.id);
      return existing.id;
    }

    // اگر نبود، یک room جدید با session_id بساز
    const { data: newRoom } = await (supabase as any)
      .from('chat_rooms')
      .insert({ session_id: sessionId, guest_name: t('مهمان-{id}', { id: sessionId.slice(0,6) }), status: 'active' })
      .select('id')
      .single();

    if (newRoom?.id) {
      setRoomId(newRoom.id);
      setupRealtime(newRoom.id);
      return newRoom.id;
    }

    return null;
  }, [roomId, sessionId, setupRealtime, loadHistory]);

  // ── ارسال پیام ─────────────────────────────────────────────────────────────
  const send = async (text: string = input.trim()) => {
    if (!text) return;

    const userMsg: Message = { id: Date.now(), from: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // ذخیره پیام در DB
    try {
      const rId = await getOrCreateRoom();
      if (rId) {
        await (supabase as any).from('chat_messages').insert({
          room_id:     rId,
          sender_id:   sessionId,
          sender_type: 'user',
          message:     text,
          is_read:     false,
        });
      }
    } catch {
      // silent — chat نباید app را break کند
    }

    // Bot پاسخ می‌دهد (با delay)
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply = botReply(text);
      setMessages(prev => [...prev, { id: Date.now() + 1, from: 'bot', text: reply }]);
    }, 1200);
  };

  if (chatEnabled === false) return null;

  return (
    <div className="chat-widget-fab fixed bottom-8 end-8 z-50 flex flex-col items-end gap-3" dir="rtl">
      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="w-[340px] sm:w-[370px] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 flex flex-col"
            style={{
              background: 'rgba(8, 18, 36, 0.97)',
              border: '1px solid rgba(255,255,255,0.10)',
              backdropFilter: 'blur(20px)',
              maxHeight: '520px',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{
                background: 'linear-gradient(135deg, rgba(0,188,212,0.18) 0%, rgba(0,150,160,0.12) 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #00BCD4, #00838F)' }}>
                    <MessageCircle size={18} className="text-white" />
                  </div>
                  <span className="absolute bottom-0 end-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#081224]" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-none mb-0.5">{tr("پشتیبانی CapNet")}</p>
                  <p className="text-green-400 text-xs">{tr("آنلاین")}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/50 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <ChevronDown size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar" style={{ minHeight: 0 }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.from === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className="max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line"
                    style={
                      msg.from === 'user'
                        ? {
                            background: 'rgba(255,255,255,0.10)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            color: '#ffffff',
                            borderBottomRightRadius: '4px',
                          }
                        : msg.from === 'admin'
                        ? {
                            background: 'linear-gradient(135deg, rgba(34,197,94,0.18) 0%, rgba(16,185,129,0.12) 100%)',
                            border: '1px solid rgba(34,197,94,0.25)',
                            color: '#d1fae5',
                            borderBottomLeftRadius: '4px',
                          }
                        : {
                            background: 'linear-gradient(135deg, rgba(0,188,212,0.20) 0%, rgba(0,100,120,0.18) 100%)',
                            border: '1px solid rgba(0,188,212,0.22)',
                            color: '#e0f7fa',
                            borderBottomLeftRadius: '4px',
                          }
                    }
                  >
                    {msg.from === 'admin' && (
                      <p className="text-[10px] text-green-400 font-bold mb-1">{tr("تیم CapNet")}</p>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div className="flex justify-end">
                  <div
                    className="flex items-center gap-1 px-4 py-3 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,188,212,0.20) 0%, rgba(0,100,120,0.18) 100%)',
                      border: '1px solid rgba(0,188,212,0.22)',
                      borderBottomLeftRadius: '4px',
                    }}
                  >
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-teal-400 rounded-full"
                        style={{ animation: `typing-dot 1.2s ease-in-out infinite ${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-4 pb-2 flex flex-wrap gap-2 justify-end">
              {quickReplies.map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
                  style={{
                    background: 'rgba(0,188,212,0.10)',
                    border: '1px solid rgba(0,188,212,0.25)',
                    color: '#80DEEA',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div
              className="px-4 py-3 flex items-center gap-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder={tr("پیام خود را بنویسید...")}
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/30 text-end"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30 hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #00BCD4, #00838F)' }}
              >
                <Send size={14} className="text-white" style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Toggle Button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #00BCD4 0%, #00838F 100%)',
          boxShadow: '0 8px 32px rgba(0,188,212,0.40), 0 2px 8px rgba(0,0,0,0.4)',
        }}
        aria-label={tr("چت با پشتیبانی")}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <X size={24} className="text-white" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <MessageCircle size={24} className="text-white" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        <AnimatePresence>
          {!open && unread > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -start-1 w-5 h-5 bg-amber-400 rounded-full text-[10px] font-black text-gray-900 flex items-center justify-center"
            >
              {unread}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full" style={{ animation: 'chat-pulse 2.5s ease-in-out infinite' }} />
        )}
      </motion.button>

      {/* Inline keyframes */}
      <style>{`
        @keyframes chat-pulse {
          0%   { box-shadow: 0 0 0 0px rgba(0,188,212,0.55); }
          70%  { box-shadow: 0 0 0 14px rgba(0,188,212,0); }
          100% { box-shadow: 0 0 0 0px rgba(0,188,212,0); }
        }
        @keyframes typing-dot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40%            { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
