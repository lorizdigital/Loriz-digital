import type { TransactionalEmail } from "./brevo";

export type InquiryEmailSection = {
  heading: string;
  items: Array<{ label: string; value: string | string[] | undefined }>;
};

export type InquiryEmailData = {
  projectType: string;
  contact: {
    name: string;
    company?: string;
    email: string;
    phone?: string;
    preferredContact: string;
  };
  sections: InquiryEmailSection[];
};

type EmailIdentity = {
  fromEmail: string;
  fromName: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function textValue(value: string | string[] | undefined): string {
  if (!value || (Array.isArray(value) && value.length === 0)) return "–";
  return Array.isArray(value) ? value.map((item) => `- ${item}`).join("\n") : value;
}

function htmlValue(value: string | string[] | undefined): string {
  if (!value || (Array.isArray(value) && value.length === 0)) return "–";
  if (Array.isArray(value)) {
    return `<ul>${value.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }
  return escapeHtml(value).replaceAll("\n", "<br>");
}

function emailIdempotencyKey(requestId: string, kind: "notification" | "confirmation"): string {
  const suffix = kind === "notification" ? "a" : "b";
  return `${requestId.slice(0, -1)}${suffix}`;
}

export function buildInquiryNotificationEmail(options: {
  requestId: string;
  recipient: string;
  identity: EmailIdentity;
  inquiry: InquiryEmailData;
}): TransactionalEmail {
  const { requestId, recipient, identity, inquiry } = options;
  const contactItems: InquiryEmailSection["items"] = [
    { label: "Name", value: inquiry.contact.name },
    { label: "Unternehmen", value: inquiry.contact.company },
    { label: "E-Mail", value: inquiry.contact.email },
    { label: "Telefon", value: inquiry.contact.phone },
    {
      label: "Bevorzugter Kontaktweg",
      value: inquiry.contact.preferredContact,
    },
  ];
  const sections: InquiryEmailSection[] = [
    { heading: "Kontakt", items: contactItems },
    {
      heading: "Projekt",
      items: [{ label: "Projektart", value: inquiry.projectType }],
    },
    ...inquiry.sections,
  ];

  const textContent = [
    "Neue Projektanfrage über loriz.digital",
    "",
    ...sections.flatMap((section) => [
      section.heading,
      ...section.items.flatMap((item) => [
        `${item.label}:`,
        textValue(item.value),
        "",
      ]),
    ]),
    `Referenz: ${requestId}`,
  ].join("\n");

  const htmlContent = `
    <h1>Neue Projektanfrage über loriz.digital</h1>
    ${sections
      .map(
        (section) => `<section><h2>${escapeHtml(section.heading)}</h2><dl>${section.items
          .map(
            (item) =>
              `<dt><strong>${escapeHtml(item.label)}</strong></dt><dd>${htmlValue(item.value)}</dd>`,
          )
          .join("")}</dl></section>`,
      )
      .join("")}
    <p><small>Referenz: ${escapeHtml(requestId)}</small></p>
  `.trim();

  return {
    sender: { email: identity.fromEmail, name: identity.fromName },
    to: [{ email: recipient }],
    replyTo: {
      email: inquiry.contact.email,
      name: inquiry.contact.name,
    },
    subject: `Neue Projektanfrage: ${inquiry.projectType}`,
    textContent,
    htmlContent,
    headers: {
      "X-Loriz-Request-ID": requestId,
      idempotencyKey: emailIdempotencyKey(requestId, "notification"),
    },
  };
}

export function buildInquiryConfirmationEmail(options: {
  requestId: string;
  identity: EmailIdentity;
  recipient: { email: string; name: string };
}): TransactionalEmail {
  const { requestId, identity, recipient } = options;
  const message =
    "Vielen Dank für Ihre Anfrage bei Loriz Digital. Ihre Angaben sind eingegangen. Ich sehe mir Ihr Vorhaben persönlich an und melde mich zeitnah bei Ihnen.";

  return {
    sender: { email: identity.fromEmail, name: identity.fromName },
    to: [recipient],
    subject: "Ihre Anfrage bei Loriz Digital ist eingegangen",
    textContent: `${message}\n\nReferenz: ${requestId}`,
    htmlContent: `<p>${escapeHtml(message)}</p><p><small>Referenz: ${escapeHtml(requestId)}</small></p>`,
    headers: {
      "X-Loriz-Request-ID": requestId,
      idempotencyKey: emailIdempotencyKey(requestId, "confirmation"),
    },
  };
}
