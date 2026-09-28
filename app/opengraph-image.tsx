import { ImageResponse } from "next/og";

// Preview shown when the link is shared (LinkedIn, WhatsApp, Slack…).
export const alt = "Rent Platform — every rent, lease, and receipt in one place";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const rows = [
  { name: "Room 101", amount: "S/ 650.00", status: "Paid", color: "#16a34a" },
  { name: "Shop A", amount: "S/ 1,800.00", status: "Partial", color: "#d97706" },
  { name: "Shop B", amount: "$950.00", status: "Overdue", color: "#dc2626" },
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 72,
          gap: 56,
          color: "#0a0a0a",
          fontFamily: "sans-serif",
          background: "linear-gradient(145deg, #ffffff 0%, #f4f4f5 100%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 560 }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>Rent Platform</div>
          <div style={{ display: "flex", fontSize: 66, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            Every rent, lease, and receipt in one place.
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#52525b" }}>
            Monthly charges, partial payments, PDF receipts and WhatsApp reminders, in English and Spanish.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 440,
            padding: 28,
            gap: 18,
            borderRadius: 24,
            background: "#ffffff",
            border: "2px solid #e4e4e7",
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ display: "flex", fontSize: 22, fontWeight: 700, color: "#52525b" }}>Payments · this month</div>
          {rows.map((row) => (
            <div
              key={row.name}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 24 }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontWeight: 700 }}>{row.name}</div>
                <div style={{ display: "flex", color: "#71717a", fontSize: 20 }}>{row.amount}</div>
              </div>
              <div
                style={{
                  display: "flex",
                  padding: "6px 16px",
                  borderRadius: 999,
                  color: "#ffffff",
                  fontSize: 18,
                  fontWeight: 700,
                  background: row.color,
                }}
              >
                {row.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
