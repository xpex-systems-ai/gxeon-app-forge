export type CoreBridgeMode = 'dry_run';

export interface ForgeProductReadyPayload {
  mode: CoreBridgeMode;
  product: Record<string, unknown>;
  integrationRequest: {
    needsWebhook: boolean;
    needsProductMapping: boolean;
    licenseReviewRequired: boolean;
  };
  approval: {
    humanApprovalRequired: true;
    humanApproved: false;
  };
  safety: {
    localOnly: true;
    noAutoFork: true;
    noAutoDeploy: true;
    noAutoPublish: true;
    noExternalCalls: true;
  };
}

const SENSITIVE_KEYS = new Set([
  'webhookurl',
  'webhooksecret',
  'webhooktoken',
  'token',
  'secret',
  'password',
  'apikey',
  'authorization',
  'checkouturl',
]);
const SENSITIVE_KEY_RE =
  /^(api[_-]?key|webhook[_-]?(url|secret|token)|checkout[_-]?url|token|secret|password|authorization)$/i;
const URL_OR_SECRET_VALUE_RE = /(https?:\/\/[^\s]+|sk-[a-z0-9]{12,}|bearer\s+[a-z0-9._-]{12,})/i;

function isSensitiveKey(key: string) {
  return SENSITIVE_KEYS.has(key.replace(/[_-]/g, '').toLowerCase()) || SENSITIVE_KEY_RE.test(key);
}

export function stripSecretLikeCoreBridgeFields<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map(stripSecretLikeCoreBridgeFields) as T;
  }

  if (input && typeof input === 'object') {
    return Object.fromEntries(
      Object.entries(input as Record<string, unknown>)
        .filter(
          ([key, value]) => !isSensitiveKey(key) && !(typeof value === 'string' && URL_OR_SECRET_VALUE_RE.test(value)),
        )
        .map(([key, value]) => [key, stripSecretLikeCoreBridgeFields(value)]),
    ) as T;
  }

  return input;
}

const asBoolean = (value: unknown) => value === true;

type CoreBridgePayloadInput = Partial<Omit<ForgeProductReadyPayload, 'integrationRequest' | 'approval'>> & {
  integrationRequest?: Partial<ForgeProductReadyPayload['integrationRequest']>;
  approval?: Partial<ForgeProductReadyPayload['approval']>;
};

export function normalizeForgeProductReadyPayload(input: CoreBridgePayloadInput = {}): ForgeProductReadyPayload {
  const safe = stripSecretLikeCoreBridgeFields(input) as CoreBridgePayloadInput;
  const integrationRequest = safe.integrationRequest || {};

  return {
    mode: 'dry_run',
    product: (safe.product as Record<string, unknown>) || {},
    integrationRequest: {
      needsWebhook: asBoolean(integrationRequest.needsWebhook),
      needsProductMapping: asBoolean(integrationRequest.needsProductMapping),
      licenseReviewRequired: asBoolean(integrationRequest.licenseReviewRequired),
    },
    approval: {
      humanApprovalRequired: true,
      humanApproved: false,
    },
    safety: {
      localOnly: true,
      noAutoFork: true,
      noAutoDeploy: true,
      noAutoPublish: true,
      noExternalCalls: true,
    },
  };
}
