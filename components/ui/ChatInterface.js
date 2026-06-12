"use client";
import { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { PillButton } from "@/components/ui/Buttons";
import { Send, ArrowLeft, Check, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function ChatInterface({ chatId, otherPartyName, backUrl }) {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!user || !chatId) return;
    
    // Using simple query without order by first to avoid index requirements, 
    // we'll sort them in memory if needed, but for robust chat we should order by createdAt
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(data);
      setLoading(false);
      
      // Auto-scroll to bottom
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, (error) => {
      // If index is missing, firebase throws error. In a real app we'd click the link to build index.
      console.error("Error fetching messages. Make sure index exists:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, chatId]);

  // Mark incoming messages as seen
  useEffect(() => {
    if (!user || messages.length === 0) return;
    
    messages.forEach((msg) => {
      if (msg.senderId !== user.uid && msg.status !== "seen") {
        updateDoc(doc(db, "chats", chatId, "messages", msg.id), {
          status: "seen"
        }).catch(err => console.error("Failed to mark as seen", err));
      }
    });
  }, [messages, user, chatId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const text = newMessage;
    setNewMessage("");

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text,
        senderId: user.uid,
        status: "sent",
        createdAt: new Date().toISOString()
      });

      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: text,
        updatedAt: new Date().toISOString()
      });

      // Notification could also be triggered here via Cloud Functions
      // but for simplicity we omit client-side chat notifications to avoid spam
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  return (
    <PageTransition className="p-4 md:p-8 max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => router.push(backUrl)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">{otherPartyName || "Chat"}</h1>
          <p className="text-xs text-muted">Real-time conversation</p>
        </div>
      </div>

      <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden relative border-glass-border">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="text-center text-muted text-sm pt-10">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted text-sm pt-10">No messages yet. Say hello!</div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === user?.uid;
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                >
                  <div 
                    className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                      isMine 
                        ? "bg-white text-black rounded-br-sm" 
                        : "bg-glass-bg border border-glass-border text-white rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-muted">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                    {isMine && (
                      <span className="text-muted">
                        {msg.status === "seen" ? (
                          <CheckCheck className="w-3 h-3 text-blue-400" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-divider bg-white/[0.02]">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 rounded-full bg-black/50 border border-glass-border text-white placeholder-muted focus:outline-none focus:border-white/30 transition-colors"
            />
            <PillButton type="submit" disabled={!newMessage.trim()} className="rounded-full w-12 h-12 p-0 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 ml-0.5" />
            </PillButton>
          </form>
        </div>
      </GlassCard>
    </PageTransition>
  );
}
