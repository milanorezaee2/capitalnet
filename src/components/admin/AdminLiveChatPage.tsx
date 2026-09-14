// ─── Admin Live Chat Page ──────────────────────────────────────────────────
// ادمین می‌تواند تمام اتاق‌های چت را ببیند، با کاربران مکالمه کند و پاسخ دهد

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, RefreshCw, Users, Circle, Power } from 'lucide-react';
import { supabase } from '../../lib/supabaseApi';
import { saveSetting } from '../../lib/settingsApi';

// ─── Types ─────────────────────────────────────────────────────────────────

interface ChatRoom {
  id: string;
  session_id: string | null;
  guest_name: string | null;
  status: string;
  created_at: string;
  last_message?: string;
  unread_count?: number;
}

interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender_type: 'user' | 'admin' | 'bot';
  message: string;
  created_at: string;
  is_read: boolean;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
}

// ─── Room List Item ────────────────────────────────────────────────────────

function RoomItem({
  room,
  active,
  onClick,
}: {
  room: ChatRoom;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-right flex items-start gap-3 px-4 py-3 transition-colors"
      style={{
        background: active ? 'rgba(0,188,212,0.10)' : 'transparent',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        borderRight: active ? '2px solid #00BCD4' : '2px solid transparent',
      }}
    >
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(0,188,212,0.15)' }}>
        <MessageCircle size={16} className="text-teal-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className="text-sm font-medium text-white truncate">
            {room.guest_name ?? `مهمان — ${(room.session_id ?? room.id).slice(6, 14)}`}
          </p>
          <span className="text-[10px] text-slate-500 flex-shrink-0">{fmtDate(room.created_at)}</span>
        </div>
        {room.last_message && (
          <p className="text-xs text-slate-500 truncate mt-0.5">{room.last_message}</p>
        )}
        {(room.unread_count ?? 0) > 0 && (
          <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(239,68,68,0.85)', color: '#fff' }}>
            {room.unread_count} جدید
          </span>
        )}
      </div>
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function AdminLiveChatPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [chatIconEnabled, setChatIconEnabled] = useState<boolean | null>(null);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Load rooms (یک query واحد به جای N+1) ────────────────────────────────
  const loadRooms = useCallback(async () => {
    setRoomsLoading(true);

    // همه اتاق‌ها را بگیر
    const { data: roomsData, error } = await (supabase as any)
      .from('chat_rooms')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !roomsData) { setRoomsLoading(false); return; }

    const rooms = roomsData as ChatRoom[];
    if (rooms.length === 0) { setRooms([]); setRoomsLoading(false); return; }

    // همه پیام‌های مرتبط را در یک query بگیر
    const roomIds = rooms.map(r => r.id);
    const { data: msgsData } = await (supabase as any)
      .from('chat_messages')
      .select('room_id, message, is_read, sender_type, created_at')
      .in('room_id', roomIds)
      .order('created_at', { ascending: false });

    const allMsgs = (msgsData ?? []) as Array<{
      room_id: string; message: string; is_read: boolean; sender_type: string; created_at: string;
    }>;

    // گروه‌بندی پیام‌ها به ازای هر اتاق
    const msgMap = new Map<string, typeof allMsgs>();
    for (const m of allMsgs) {
      if (!msgMap.has(m.room_id)) msgMap.set(m.room_id, []);
      msgMap.get(m.room_id)!.push(m);
    }

    const enriched: ChatRoom[] = rooms.map(room => {
      const msgs = msgMap.get(room.id) ?? [];
      const last = msgs[0]?.message || '';
      const unread = msgs.filter(m => !m.is_read && m.sender_type !== 'admin').length;
      return { ...room, last_message: last, unread_count: unread };
    });

    setRooms(enriched);
    setRoomsLoading(false);
  }, []);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  // load chat icon setting
  useEffect(() => {
    let mounted = true;
    (async () => {
      try{
        const { data } = await (supabase as any)
          .from('site_settings')
          .select('value')
          .eq('key', 'chat_icon_enabled')
          .maybeSingle();
        if(!mounted) return;
        const val = data?.value;
        if(val === undefined || val === null) setChatIconEnabled(true);
        else setChatIconEnabled(val === true || val === 'true');
      }catch(e){
        if(mounted) setChatIconEnabled(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ── Realtime: اتاق‌های جدید ───────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('admin-chat-rooms')
      .on('postgres_changes' as any, { event: 'INSERT', schema: 'public', table: 'chat_rooms' },
        () => loadRooms())
      .on('postgres_changes' as any, { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        () => loadRooms())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadRooms]);

  // ── Load messages for active room ──────────────────────────────────────────
  const loadMessages = useCallback(async (roomId: string) => {
    setMsgsLoading(true);
    const { data, error } = await (supabase as any)
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data as ChatMessage[]);
      // علامت‌گذاری پیام‌های کاربر به عنوان خوانده شده
      await (supabase as any)
        .from('chat_messages')
        .update({ is_read: true })
        .eq('room_id', roomId)
        .neq('sender_type', 'admin');
    }
    setMsgsLoading(false);
  }, []);

  // ── Realtime: پیام‌های اتاق فعال ─────────────────────────────────────────
  useEffect(() => {
    if (!activeRoom) return;
    loadMessages(activeRoom.id);

    const channel = supabase
      .channel(`admin-room-${activeRoom.id}`)
      .on('postgres_changes' as any,
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${activeRoom.id}` },
        (payload: any) => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeRoom, loadMessages]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Focus input when room changes ──────────────────────────────────────────
  useEffect(() => {
    if (activeRoom) setTimeout(() => inputRef.current?.focus(), 200);
  }, [activeRoom]);

  // ── Send reply ─────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!replyText.trim() || !activeRoom || sending) return;
    const text = replyText.trim();
    setReplyText('');
    setSending(true);

    await (supabase as any).from('chat_messages').insert({
      room_id:     activeRoom.id,
      sender_type: 'admin',
      sender_id:   'admin',
      message:     text,
      is_read:     false,
    });

    setSending(false);
    loadRooms(); // آپدیت آخرین پیام در لیست
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] gap-0" dir="rtl">

      {/* ── Chat Icon Toggle Banner ───────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 rounded-2xl mb-3"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: chatIconEnabled ? 'rgba(0,188,212,0.15)' : 'rgba(255,255,255,0.06)' }}>
            <MessageCircle size={15} className={chatIconEnabled ? 'text-teal-400' : 'text-slate-500'} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">آیکون چت در سایت</p>
            <p className="text-xs text-slate-500">
              {chatIconEnabled === null
                ? 'در حال بارگذاری...'
                : chatIconEnabled
                  ? 'آیکون چت برای بازدیدکنندگان سایت نمایش داده می‌شود'
                  : 'آیکون چت از سایت مخفی شده است'}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          title={chatIconEnabled ? 'غیرفعال کردن آیکون چت' : 'فعال کردن آیکون چت'}
          disabled={chatIconEnabled === null}
          onClick={async () => {
            const next = !chatIconEnabled;
            setChatIconEnabled(next);
            try { await saveSetting('chat_icon_enabled', next); } catch (e) { console.error(e); }
          }}
          className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 hover:opacity-90"
          style={chatIconEnabled
            ? { background: 'rgba(0,188,212,0.15)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.3)' }
            : { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }
          }
        >
          <Power size={14} />
          {chatIconEnabled ? 'فعال — خاموش کن' : 'غیرفعال — روشن کن'}
        </button>
      </div>

      {/* ── Chat Area ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 gap-0 rounded-2xl overflow-hidden min-h-0"
        style={{ border: '1px solid rgba(255,255,255,0.07)' }}>

      {/* ── Room List ──────────────────────────────────────────────────────── */}
      <div className="w-72 flex-shrink-0 flex flex-col"
        style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-teal-400" />
            <h2 className="text-sm font-bold text-white">چت‌های فعال</h2>
            {rooms.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: 'rgba(0,188,212,0.15)', color: '#00BCD4' }}>
                {rooms.length}
              </span>
            )}
          </div>
          <button onClick={loadRooms} disabled={roomsLoading}
            className="text-slate-400 hover:text-white transition-colors p-1">
            <RefreshCw size={14} className={roomsLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Rooms */}
        <div className="flex-1 overflow-y-auto">
          {roomsLoading ? (
            <div className="flex items-center justify-center py-12">
              <span className="w-5 h-5 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageCircle size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">هنوز چتی وجود ندارد</p>
            </div>
          ) : (
            rooms.map(room => (
              <RoomItem
                key={room.id}
                room={room}
                active={activeRoom?.id === room.id}
                onClick={() => setActiveRoom(room)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Chat Panel ─────────────────────────────────────────────────────── */}
      {activeRoom ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
            <div className="relative">
              <div className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,188,212,0.15)' }}>
                <MessageCircle size={16} className="text-teal-400" />
              </div>
              <Circle size={8} className="absolute bottom-0 left-0 text-green-400" fill="#4ade80" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {activeRoom.guest_name ?? `مهمان — ${(activeRoom.session_id ?? activeRoom.id).slice(6, 14)}`}
              </p>
              <p className="text-xs text-slate-500">
                اتاق #{activeRoom.id.slice(0, 8)} &nbsp;·&nbsp; {fmtDate(activeRoom.created_at)}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {msgsLoading ? (
              <div className="flex items-center justify-center py-12">
                <span className="w-5 h-5 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 text-sm">هنوز پیامی وجود ندارد</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender_type === 'admin' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className="max-w-[70%] space-y-1">
                      {msg.sender_type !== 'admin' && (
                        <p className="text-[10px] text-slate-500 text-left px-1">
                          {msg.sender_type === 'bot' ? 'ربات' : 'کاربر'} · {fmtTime(msg.created_at)}
                        </p>
                      )}
                      <div
                        className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line"
                        style={
                          msg.sender_type === 'admin'
                            ? { background: 'linear-gradient(135deg,rgba(0,188,212,0.22),rgba(0,130,145,0.18))', border: '1px solid rgba(0,188,212,0.25)', color: '#e0f7fa', borderBottomRightRadius: '4px' }
                            : msg.sender_type === 'bot'
                            ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', borderBottomLeftRadius: '4px' }
                            : { background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderBottomLeftRadius: '4px' }
                        }
                      >
                        {msg.sender_type === 'admin' && (
                          <p className="text-[10px] text-teal-400 font-bold mb-1">تیم CapNet</p>
                        )}
                        {msg.message}
                      </div>
                      {msg.sender_type === 'admin' && (
                        <p className="text-[10px] text-slate-500 text-right px-1">{fmtTime(msg.created_at)}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="px-5 py-4 flex items-center gap-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
            <input
              ref={inputRef}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="پاسخ خود را بنویسید..."
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/30 text-right"
            />
            <button
              onClick={handleSend}
              disabled={!replyText.trim() || sending}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30 hover:scale-110"
              style={{ background: 'linear-gradient(135deg,#00BCD4,#00838F)' }}
            >
              <Send size={15} className="text-white" style={{ transform: 'rotate(180deg)' }} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <MessageCircle size={48} className="text-slate-700" />
          <p className="text-slate-400 text-sm">یک مکالمه را از لیست انتخاب کنید</p>
        </div>
      )}
      </div>{/* end Chat Area wrapper */}
    </div>
  );
}
