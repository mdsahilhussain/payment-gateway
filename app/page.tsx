"use client";
import "./globals.css";

import { PaymentForm } from "@/components/PaymentForm";

export default function Home() {
  return (
    <main className="page-shell">
       <PaymentForm />
    </main>
  );
}