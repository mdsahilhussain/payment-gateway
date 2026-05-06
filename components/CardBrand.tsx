import type { CardType } from "@/types/payment";

interface CardBrandProps {
  cardType: CardType;
}

/**
 * Work: Renders the brand mark for the detected card type.
 * Returns null for "unknown" so the badge slot stays empty pre-detection.
 */
export function CardBrand({ cardType }: CardBrandProps) {
  switch (cardType) {
    case "visa":
      return <VisaMark />;
    case "mastercard":
      return <MastercardMark />;
    case "amex":
      return <AmexMark />;
    default:
      return null;
  }
}

function VisaMark() {
  return (
    <svg
      viewBox="0 0 100 32"
      xmlns="http://www.w3.org/2000/svg"
      className="card-brand-img"
      aria-label="Visa"
    >
      <text
        x="50"
        y="25"
        textAnchor="middle"
        fontSize="26"
        fontWeight="900"
        fontStyle="italic"
        fontFamily="Arial, Helvetica, sans-serif"
        fill="#fff"
        letterSpacing="-1"
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardMark() {
  return (
    <svg
      viewBox="0 0 60 40"
      xmlns="http://www.w3.org/2000/svg"
      className="card-brand-img"
      aria-label="Mastercard"
    >
      <circle cx="22" cy="20" r="14" fill="#EB001B" />
      <circle cx="38" cy="20" r="14" fill="#F79E1B" fillOpacity="0.85" />
    </svg>
  );
}

function AmexMark() {
  return (
    <svg
      viewBox="0 0 100 50"
      xmlns="http://www.w3.org/2000/svg"
      className="card-brand-img"
      aria-label="American Express"
    >
      <rect width="100" height="50" rx="4" fill="#006FCF" />
      <text
        x="50"
        y="22"
        textAnchor="middle"
        fontSize="11"
        fontWeight="900"
        fontFamily="Arial, Helvetica, sans-serif"
        fill="#fff"
        letterSpacing="0.5"
      >
        AMERICAN
      </text>
      <text
        x="50"
        y="36"
        textAnchor="middle"
        fontSize="11"
        fontWeight="900"
        fontFamily="Arial, Helvetica, sans-serif"
        fill="#fff"
        letterSpacing="0.5"
      >
        EXPRESS
      </text>
    </svg>
  );
}