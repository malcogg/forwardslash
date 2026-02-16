"use client";

import { useParams } from "next/navigation";
import { CustomerChat } from "@/components/CustomerChat";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CustomerChatPage() {
  const params = useParams();
  const customerId = params.customerId as string;
  const [customer, setCustomer] = useState<{ businessName: string; primaryColor: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      setError("Missing customer");
      return;
    }
    fetch(`/api/chat/customer/${customerId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Not found"))))
      .then(setCustomer)
      .catch(() => setError("Chatbot not found"))
      .finally(() => setLoading(false));
  }, [customerId]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  if (error || !customer) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error ?? "Chatbot not found"}</p>
          <Link href="/" className="text-emerald-600 hover:underline">Back to ForwardSlash.Chat</Link>
        </div>
      </main>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="flex items-center justify-end px-4 py-2 border-b border-gray-200 bg-white shrink-0">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
          ForwardSlash.Chat
        </Link>
      </header>
      <div className="flex-1 min-h-0 overflow-hidden">
        <CustomerChat
          customerId={customerId}
          businessName={customer.businessName}
          primaryColor={customer.primaryColor ?? "#6B4E3D"}
          compact={false}
        />
      </div>
    </div>
  );
}
