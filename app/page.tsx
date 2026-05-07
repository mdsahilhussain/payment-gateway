"use client";
import { PaymentFlow } from "@/components/PaymentFlow";
import "./globals.css";

export default function Home() {
  return (
    <main className="page-shell">
       <PaymentFlow />
    </main>
  );
}