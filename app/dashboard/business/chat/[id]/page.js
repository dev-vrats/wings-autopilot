"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ChatInterface } from "@/components/ui/ChatInterface";
import { useAuth } from "@/context/AuthContext";

export default function BusinessChatPage({ params }) {
  const { id: chatId } = params;
  const { user } = useAuth();
  const [providerName, setProviderName] = useState("");

  useEffect(() => {
    const fetchChatDetails = async () => {
      try {
        const docRef = doc(db, "inquiries", chatId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProviderName(docSnap.data().providerName);
        }
      } catch (err) {
        console.error("Error fetching chat details", err);
      }
    };
    if (user) {
      fetchChatDetails();
    }
  }, [chatId, user]);

  return (
    <ChatInterface 
      chatId={chatId} 
      otherPartyName={providerName || "Service Provider"} 
      backUrl="/dashboard/business/requests" 
    />
  );
}
