import React, { useEffect, useState } from 'react';
import supabase from '../lib/supabaseApi';

type Notification = {
  id: string;
  type: string;
  payload: any;
  target_role: string;
  read: boolean;
  created_at: string;
};

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; title: string; message?: string }>>([]);

  const addToast = (id: string, title: string, message?: string) => {
    const toast = { id, title, message };
    setToasts(prev => [toast, ...prev].slice(0, 5));
    // auto-remove after 5s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  useEffect(() => {
    let mounted = true;

    async function fetchNotifications() {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('target_role', 'admin')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) {
        console.error('fetch notifications error', error);
        return;
      }
      if (!mounted) return;
      setNotifications(data || []);
    }

    fetchNotifications();

    const subscription = supabase
      .from('notifications')
      .on('INSERT', (payload: any) => {
        const n: Notification = payload.new;
        if (n.target_role === 'admin') {
          setNotifications(prev => [n, ...prev]);
          try {
            const msg = typeof n.payload === 'object' ? (n.payload.full_name ?? JSON.stringify(n.payload)) : String(n.payload);
            addToast(n.id, n.type, msg);
          } catch {
            addToast(n.id, n.type);
          }
        }
      })
      .subscribe();

    return () => {
      mounted = false;
      // cleanup subscription (supabase-js v1 style)
      // If using supabase-js v2, replace with appropriate channel unsubscribe
      try {
        // @ts-ignore
        supabase.removeSubscription(subscription);
      } catch (e) {
        // fallback for other SDK versions
        // @ts-ignore
        if (subscription && subscription.unsubscribe) subscription.unsubscribe();
      }
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (error) {
      console.error('mark read error', error);
      return;
    }
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} aria-label="notifications">
        🔔{unreadCount > 0 ? ` (${unreadCount})` : ''}
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: '100%', width: 360, maxHeight: 480, overflow: 'auto', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 50 }}>
          {notifications.length === 0 && <div style={{ padding: 12 }}>No notifications</div>}
          {notifications.map(n => (
            <div key={n.id} style={{ padding: 12, borderBottom: '1px solid #eee', background: n.read ? '#fff' : '#f7fbff' }}>
              <div style={{ fontSize: 13, color: '#111' }}>{n.type}</div>
              <div style={{ fontSize: 12, color: '#444', marginTop: 6 }}>{JSON.stringify(n.payload)}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                {!n.read && (
                  <button onClick={() => markAsRead(n.id)} style={{ fontSize: 12 }}>Mark read</button>
                )}
                <div style={{ fontSize: 11, color: '#888', marginLeft: 'auto' }}>{new Date(n.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast container */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 60, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ minWidth: 240, maxWidth: 360, background: '#111827', color: '#fff', padding: '10px 12px', borderRadius: 8, boxShadow: '0 8px 20px rgba(0,0,0,0.2)', fontSize: 13 }}>
            <div style={{ fontWeight: 600 }}>{t.title}</div>
            {t.message && <div style={{ marginTop: 6, fontSize: 12, color: '#d1d5db' }}>{t.message}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
