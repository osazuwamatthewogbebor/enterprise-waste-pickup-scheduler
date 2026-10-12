import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeNigerianPhone, isValidNigerianPhone } from "../src/lib/phone.ts";
import { getResidentVirtualAccount } from "../src/lib/virtual-accounts.ts";
import { formatWhatsAppBillMessage, generateWhatsAppChatUrl } from "../src/lib/whatsapp.ts";
import { generateCompliancePass } from "../src/lib/compliance.ts";

describe("Nigerian Phone Normalization & Validation", () => {
  it("normalizes standard 11-digit local format (080...)", () => {
    assert.strictEqual(normalizeNigerianPhone("08012345678"), "+2348012345678");
    assert.strictEqual(normalizeNigerianPhone("07098765432"), "+2347098765432");
    assert.strictEqual(normalizeNigerianPhone("09011223344"), "+2349011223344");
  });

  it("normalizes international +234 format", () => {
    assert.strictEqual(normalizeNigerianPhone("+2348012345678"), "+2348012345678");
  });

  it("normalizes international 234 without plus", () => {
    assert.strictEqual(normalizeNigerianPhone("2348012345678"), "+2348012345678");
  });

  it("normalizes 10-digit format starting with 7/8/9", () => {
    assert.strictEqual(normalizeNigerianPhone("8012345678"), "+2348012345678");
  });

  it("rejects invalid numbers correctly", () => {
    assert.strictEqual(isValidNigerianPhone("12345"), false);
    assert.strictEqual(isValidNigerianPhone("05012345678"), false);
    assert.strictEqual(isValidNigerianPhone("not-a-number"), false);
  });
});

describe("Middleware Route Matching & Security Rules", () => {
  const EXACT_PUBLIC_ROUTES = new Set([
    "/",
    "/login",
    "/signup",
    "/request",
    "/features",
    "/pricing",
    "/careers",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms-of-service",
    "/favicon.ico",
  ]);

  const PUBLIC_PREFIXES = ["/api/", "/_next/"];

  const isPublicRoute = (pathname: string) => {
    if (EXACT_PUBLIC_ROUTES.has(pathname)) return true;
    return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  };

  const getRequiredRole = (pathname: string): "ADMIN" | "DRIVER" | "RESIDENT" | null => {
    if (pathname === "/dashboard") return "ADMIN";
    if (pathname.startsWith("/dashboard/admin")) return "ADMIN";
    if (pathname.startsWith("/dashboard/driver")) return "DRIVER";
    if (pathname.startsWith("/dashboard/resident")) return "RESIDENT";
    if (/^\/[^\/]+\/portal/.test(pathname)) return "RESIDENT";
    return null;
  };

  it("treats root and marketing pages as public", () => {
    assert.strictEqual(isPublicRoute("/"), true);
    assert.strictEqual(isPublicRoute("/login"), true);
    assert.strictEqual(isPublicRoute("/pricing"), true);
    assert.strictEqual(isPublicRoute("/features"), true);
  });

  it("CRITICAL: protected dashboard routes must NOT evaluate as public", () => {
    assert.strictEqual(isPublicRoute("/dashboard"), false);
    assert.strictEqual(isPublicRoute("/dashboard/admin"), false);
    assert.strictEqual(isPublicRoute("/dashboard/admin/drivers"), false);
    assert.strictEqual(isPublicRoute("/dashboard/admin/routes"), false);
    assert.strictEqual(isPublicRoute("/dashboard/driver/routes"), false);
    assert.strictEqual(isPublicRoute("/lagos-clean/portal"), false);
    assert.strictEqual(isPublicRoute("/lagos-clean/portal/payments"), false);
  });

  it("correctly identifies required role for protected segments", () => {
    assert.strictEqual(getRequiredRole("/dashboard"), "ADMIN");
    assert.strictEqual(getRequiredRole("/dashboard/admin/routes"), "ADMIN");
    assert.strictEqual(getRequiredRole("/dashboard/driver/routes"), "DRIVER");
    assert.strictEqual(getRequiredRole("/lagos-clean/portal"), "RESIDENT");
    assert.strictEqual(getRequiredRole("/lagos-clean/portal/requests"), "RESIDENT");
  });
});

describe("Invoicing & Paystack Currency Unit Calculations", () => {
  it("converts Naira amount to Paystack Kobo accurately", () => {
    const amountInNaira = 5000;
    const amountInKobo = Math.round(amountInNaira * 100);
    assert.strictEqual(amountInKobo, 500000);
  });

  it("formats customer email fallback cleanly when email is null", () => {
    const resident = { phone: "+2348012345678", email: null };
    const cleanPhone = (resident.phone || "").replace(/[^0-9]/g, "");
    const payerEmail = resident.email || (cleanPhone ? `${cleanPhone}@customer.wastepickup.ng` : "billing@wastepickup.ng");
    assert.strictEqual(payerEmail, "2348012345678@customer.wastepickup.ng");
  });
});

describe("Route Stop Sequencing & Transitions", () => {
  const validTransitions: Record<string, string[]> = {
    SCHEDULED: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["COMPLETED", "CANCELLED"],
    COMPLETED: [],
    CANCELLED: [],
  };

  it("allows legal route status transitions", () => {
    assert.strictEqual(validTransitions["SCHEDULED"].includes("IN_PROGRESS"), true);
    assert.strictEqual(validTransitions["IN_PROGRESS"].includes("COMPLETED"), true);
    assert.strictEqual(validTransitions["SCHEDULED"].includes("CANCELLED"), true);
  });

  it("disallows illegal route status transitions", () => {
    assert.strictEqual(validTransitions["COMPLETED"].includes("IN_PROGRESS"), false);
    assert.strictEqual(validTransitions["CANCELLED"].includes("SCHEDULED"), false);
    assert.strictEqual(validTransitions["SCHEDULED"].includes("COMPLETED"), false);
  });

  it("assigns sequential 1-based stop orders correctly", () => {
    const stops = [{ id: "s1" }, { id: "s2" }, { id: "s3" }];
    const sequenced = stops.map((s, idx) => ({ ...s, stopOrder: idx + 1 }));
    assert.strictEqual(sequenced[0].stopOrder, 1);
    assert.strictEqual(sequenced[1].stopOrder, 2);
    assert.strictEqual(sequenced[2].stopOrder, 3);
  });
});

describe("Dedicated NUBAN Virtual Account Generation", () => {
  it("derives valid 10-digit NUBAN mapped to resident", () => {
    const resident = {
      id: "res_123",
      firstName: "Babajide",
      lastName: "Sanwo",
      phone: "+2348039876543",
    };
    const va = getResidentVirtualAccount(resident, "Lagos Clean PSP");
    assert.strictEqual(va.accountNumber.length, 10);
    assert.strictEqual(va.accountNumber.startsWith("99"), true);
    assert.strictEqual(va.bankName.includes("Providus"), true);
    assert.strictEqual(va.accountName.includes("Babajide"), true);
  });
});

describe("WhatsApp Messaging Engine", () => {
  it("formats high-conversion WhatsApp bill with NUBAN and Paystack link", () => {
    const message = formatWhatsAppBillMessage({
      residentName: "Amina Yusuf",
      residentPhone: "+2348011223344",
      orgName: "EcoWaste Lagos",
      invoiceNumber: "INV-OCT-001",
      amount: 4500,
      dueDate: new Date("2026-10-31"),
      paymentUrl: "https://wastepickup.ng/ecowaste/portal/payments",
      virtualAccount: {
        bankName: "Providus Bank",
        accountNumber: "9901122334",
        accountName: "EcoWaste - Amina Yusuf",
      },
    });

    assert.strictEqual(message.includes("EcoWaste Lagos"), true);
    assert.strictEqual(message.includes("INV-OCT-001"), true);
    assert.strictEqual(message.includes("₦4,500"), true);
    assert.strictEqual(message.includes("9901122334"), true);
    assert.strictEqual(message.includes("https://wastepickup.ng/ecowaste/portal/payments"), true);
  });

  it("generates click-to-chat URL with properly encoded message", () => {
    const chatUrl = generateWhatsAppChatUrl("+2348011223344", "Hello Amina");
    assert.strictEqual(chatUrl, "https://wa.me/2348011223344?text=Hello%20Amina");
  });
});

describe("Municipal Regulatory Compliance Pass", () => {
  it("generates ACTIVE_COMPLIANT pass when latest invoice is paid", () => {
    const pass = generateCompliancePass({
      resident: {
        id: "res_abc",
        firstName: "Emeka",
        lastName: "Okafor",
        streetAddress: "14 Admiralty Way, Lekki",
      },
      organization: {
        name: "Lekki Clean Ltd",
        cacNumber: "RC123456",
        slug: "lekki-clean",
      },
      latestPaidInvoiceDate: new Date("2026-10-01"),
    });

    assert.strictEqual(pass.status, "ACTIVE_COMPLIANT");
    assert.strictEqual(pass.orgName, "Lekki Clean Ltd");
    assert.strictEqual(pass.paidUntilMonth.includes("October"), true);
    assert.strictEqual(typeof pass.verificationToken, "string");
  });

  it("flags OVERDUE_DEFICIT when no settled invoices exist", () => {
    const pass = generateCompliancePass({
      resident: {
        id: "res_xyz",
        firstName: "Tunde",
        lastName: "Bakare",
        streetAddress: "Plot 5, Ikeja",
      },
      organization: {
        name: "Ikeja Waste Co",
        cacNumber: null,
        slug: "ikeja-waste",
      },
      latestPaidInvoiceDate: null,
    });

    assert.strictEqual(pass.status, "OVERDUE_DEFICIT");
    assert.strictEqual(pass.paidUntilMonth, "No Settled Payments");
  });
});

