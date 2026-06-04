const PAYPAL_BASE =
  process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID ?? "";
  const secret = process.env.PAYPAL_CLIENT_SECRET ?? "";
  const credentials = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal token error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

interface CreateOrderParams {
  amount: number;
  currency: string;
  planId: string;
  companyId: string;
  userId: string;
  description: string;
}

interface CreateOrderResult {
  id: string;
  approveUrl: string;
}

interface PayPalLink {
  href: string;
  rel: string;
  method?: string;
}

interface PayPalOrderResponse {
  id: string;
  links: PayPalLink[];
}

export async function createOrder(
  params: CreateOrderParams
): Promise<CreateOrderResult> {
  const { amount, currency, planId, companyId, userId, description } = params;
  const accessToken = await getAccessToken();
  const baseUrl = process.env.NEXTAUTH_URL ?? "";

  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: amount.toFixed(2),
        },
        description,
        custom_id: JSON.stringify({ planId, companyId, userId }),
      },
    ],
    application_context: {
      return_url: `${baseUrl}/api/payments/paypal/capture-order`,
      cancel_url: `${baseUrl}/pricing`,
      brand_name: "DentalBilling.us",
      user_action: "PAY_NOW",
    },
  };

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal create order error ${res.status}: ${text}`);
  }

  const order = (await res.json()) as PayPalOrderResponse;

  const approveLink = order.links.find((l) => l.rel === "approve");
  if (!approveLink) {
    throw new Error("PayPal response missing approve link");
  }

  return { id: order.id, approveUrl: approveLink.href };
}

interface CaptureOrderResult {
  id: string;
  status: string;
  customId: string;
  amount: string;
  currency: string;
}

interface PayPalCaptureResponse {
  id: string;
  status: string;
  purchase_units: Array<{
    custom_id?: string;
    payments?: {
      captures?: Array<{
        amount?: {
          value?: string;
          currency_code?: string;
        };
      }>;
    };
  }>;
}

export async function captureOrder(
  orderId: string
): Promise<CaptureOrderResult> {
  const accessToken = await getAccessToken();

  const res = await fetch(
    `${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal capture error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as PayPalCaptureResponse;

  const purchaseUnit = data.purchase_units[0];
  const capture = purchaseUnit?.payments?.captures?.[0];

  return {
    id: data.id,
    status: data.status,
    customId: purchaseUnit?.custom_id ?? "",
    amount: capture?.amount?.value ?? "0",
    currency: capture?.amount?.currency_code ?? "USD",
  };
}
