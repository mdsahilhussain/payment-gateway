"use client";
import "./globals.css";

import { useState } from "react";
import { CardPreview } from "@/components/CardPreview";
import { formatCardNumber } from "@/utils/format";

export default function Home() {
  const [flipped, setFlipped] = useState(false);

  return (
    <main className="page-shell">
      <div className="payment-container">
        <div className="card-preview-wrap">
          <CardPreview
            cardNumber={formatCardNumber("4242424242424242")}
            cardholderName="Aman Sharma"
            expiryMonth="08"
            expiryYear="2028"
            cvv="123"
            isFlipped={flipped}
          />
        </div>
        <div className="form-card">
          <button
            className="btn-secondary"
            onClick={() => setFlipped((v) => !v)}
          >
            Toggle flip ({flipped ? "back" : "front"})
          </button>
        </div>
      </div>
    </main>
  );
}