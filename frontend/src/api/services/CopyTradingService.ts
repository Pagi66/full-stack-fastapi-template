import { OpenAPI } from "../core/OpenAPI";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type TraderStatus = "ACTIVE" | "PAUSED" | "STOPPED";

export interface TraderSummary {
  id: string;
  traderCode: string;
  displayName: string;
  specialty: string;
  riskLevel: RiskLevel;
  performance: string;
  winRate: string;
}

export interface VerifyTraderResponse {
  valid: boolean;
  message?: string;
  trader?: TraderSummary;
}

export interface CopiedTrader extends TraderSummary {
  copyId: string;
  allocation: number;
  status: TraderStatus;
}

export interface StartCopyTradingResponse {
  success: boolean;
  message: string;
  copiedTrader?: CopiedTrader;
}

type BackendTraderSummary = {
  id: string;
  trader_code: string;
  display_name: string;
  specialty: string;
  risk_level: RiskLevel;
  performance: string;
  win_rate: string;
};

type BackendVerifyResponse = {
  valid: boolean;
  message?: string | null;
  trader?: BackendTraderSummary | null;
};

type BackendCopiedTrader = BackendTraderSummary & {
  copy_id: string;
  allocation: number;
  status: TraderStatus;
};

type BackendCopiedResponse = {
  data: BackendCopiedTrader[];
  count: number;
};

type BackendStartResponse = {
  success: boolean;
  message: string;
  copied_trader?: BackendCopiedTrader | null;
};

const apiBase = () => (OpenAPI.BASE ?? "").replace(/\/$/, "");

const resolveToken = async (): Promise<string | undefined> => {
  const tokenGetter = OpenAPI.TOKEN;
  if (typeof tokenGetter === "function") {
    const token = await tokenGetter();
    return token ? token : undefined;
  }

  if (typeof tokenGetter === "string" && tokenGetter.trim()) {
    return tokenGetter;
  }

  return undefined;
};

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = await response.json();
    if (typeof data?.detail === "string") {
      return data.detail;
    }
    if (typeof data?.message === "string") {
      return data.message;
    }
  } catch (error) {
    // Ignore parse errors and fall back to status text.
  }

  return response.statusText || "Request failed";
};

const mapTraderSummary = (payload: BackendTraderSummary): TraderSummary => ({
  id: payload.id,
  traderCode: payload.trader_code,
  displayName: payload.display_name,
  specialty: payload.specialty,
  riskLevel: payload.risk_level,
  performance: payload.performance,
  winRate: payload.win_rate,
});

const mapCopiedTrader = (payload: BackendCopiedTrader): CopiedTrader => ({
  ...mapTraderSummary(payload),
  copyId: payload.copy_id,
  allocation: payload.allocation,
  status: payload.status,
});

const authorizedFetch = async <T>(path: string, init: RequestInit): Promise<T> => {
  const token = await resolveToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export class CopyTradingService {
  static async verifyTraderCode(traderCode: string): Promise<VerifyTraderResponse> {
    const payload = await authorizedFetch<BackendVerifyResponse>(
      "/api/v1/copy-trading/verify",
      {
        method: "POST",
        body: JSON.stringify({ trader_code: traderCode }),
      }
    );

    return {
      valid: payload.valid,
      message: payload.message ?? undefined,
      trader: payload.trader ? mapTraderSummary(payload.trader) : undefined,
    };
  }

  static async getCopiedTraders(): Promise<CopiedTrader[]> {
    const payload = await authorizedFetch<BackendCopiedResponse>(
      "/api/v1/copy-trading/copied",
      {
        method: "GET",
      }
    );

    return payload.data.map(mapCopiedTrader);
  }

  static async startCopyTrading(params: {
    traderId?: string;
    traderCode?: string;
    allocation: number;
  }): Promise<StartCopyTradingResponse> {
    const payload = await authorizedFetch<BackendStartResponse>(
      "/api/v1/copy-trading/start",
      {
        method: "POST",
        body: JSON.stringify({
          trader_id: params.traderId,
          trader_code: params.traderCode,
          allocation_amount: params.allocation,
        }),
      }
    );

    return {
      success: payload.success,
      message: payload.message,
      copiedTrader: payload.copied_trader ? mapCopiedTrader(payload.copied_trader) : undefined,
    };
  }
}

