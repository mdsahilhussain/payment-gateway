"use client";
import { useState } from "react";

import type { CardType } from "@/types/payment";
import { detectCardType } from "@/utils/cardType";
import { CardChip } from "./CardChip";
import { CardBrand } from "./CardBrand";
import { cn } from "@/utils";

/**
 * Title: Five card-background gradients picked at random on mount.
 */
const CARD_BACKGROUNDS = [
    "linear-gradient(135deg, #4158d0 0%, #c850c0 50%, #ffcc70 100%)",
    "linear-gradient(135deg, #0093e9 0%, #80d0c7 100%)",
    "linear-gradient(135deg, #2364d2 0%, #5a3aa3 50%, #1a3b5d 100%)",
    "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    "linear-gradient(135deg, #232526 0%, #414345 100%)",
] as const;

interface CardPreviewProps {
    cardNumber: string;
    cardholderName: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    isFlipped: boolean;
}

export function CardPreview({
    cardNumber,
    cardholderName,
    expiryMonth,
    expiryYear,
    cvv,
    isFlipped,
}: CardPreviewProps) {
    const cardType = detectCardType(cardNumber);

    const [bgIndex] = useState(() => Math.floor(Math.random() * CARD_BACKGROUNDS.length));
    const background = CARD_BACKGROUNDS[bgIndex];

    console.log('CardPreview render:', { cardNumber, cardType, isFlipped });

    return (
        <div className="card-preview-wrap">
            <div className="card-preview">
                <div className={cn("card-flipper ", isFlipped && "card-flipped")}>
                    {/* ----- FRONT ----- */}
                    <div className="card-side">
                        <div
                            className="card-bg"
                            style={{ backgroundImage: background }}
                            aria-hidden
                        />
                        <div className="card-front">
                            <div className="card-top">
                                <CardChip />
                                <div className="card-brand-slot">
                                    <CardBrand cardType={cardType} />
                                </div>
                            </div>

                            <CardNumberDisplay
                                cardNumber={cardNumber}
                                cardType={cardType}
                            />

                            <div className="card-info">
                                <div className="card-holder">
                                    <div className="card-holder-label">Card Holder</div>
                                    <div className="card-holder-name">
                                        {cardholderName.trim() || (
                                            <span className="card-holder-placeholder">
                                                Full Name
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="card-expiry">
                                    <div className="card-expiry-label">Expires</div>
                                    <span className="card-expiry-value">
                                        {expiryMonth || "MM"}/
                                        {expiryYear ? expiryYear.slice(-2) : "YY"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ----- BACK ----- */}
                    <div className="card-side card-side-back">
                        <div
                            className="card-bg"
                            style={{ backgroundImage: background }}
                            aria-hidden
                        />
                        <div className="card-back-band" />
                        <div className="card-cvv-section">
                            <div className="card-cvv-label">CVV</div>
                            <div className="card-cvv-band card-cvv-mask">
                                {"*".repeat(cvv.length)}
                            </div>
                            <div className="card-cvv-brand-wrap">
                                <div className="card-brand-slot">
                                    <CardBrand cardType={cardType} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** 
 * Work: Renders the card number with brand-aware masking.
 *  - First 4 digits: always visible
 *  - Middle digits (positions 5–14 for Visa/MC, 5–13 for Amex): masked as *
 *  - Last 4 (Visa/MC) or last 3 (Amex): visible
 */

interface CardNumberDisplayProps {
    cardNumber: string;
    cardType: CardType;
}

function CardNumberDisplay({ cardNumber, cardType }: CardNumberDisplayProps) {
    const mask =
        cardType === "amex" ? "#### ###### #####" : "#### #### #### ####";
    const maskRangeEndExclusive = cardType === "amex" ? 14 : 15;

    return (
        <div className="card-number">
            {Array.from(mask).map((maskChar, index) => {
                const isSpace = maskChar === " ";
                const inMaskRange = index > 4 && index < maskRangeEndExclusive;
                const hasTyped = index < cardNumber.length;

                let displayChar: string;
                if (isSpace) {
                    displayChar = " ";
                } else if (inMaskRange && hasTyped) {
                    displayChar = "*";
                } else if (hasTyped) {
                    displayChar = cardNumber[index];
                } else {
                    displayChar = "#";
                }

                return (
                    <span
                        key={index}
                        className={cn("card-number-digit", isSpace && "card-number-digit-empty"
                        )}
                    >
                        {displayChar}
                    </span>
                );
            })}
        </div>
    );
}