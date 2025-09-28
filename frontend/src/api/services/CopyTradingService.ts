import { OpenAPI } from "../core/OpenAPI";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type TraderStatus = "ACTIVE" | "PAUSED" | "STOPPED";
export type ExecutionEventType =
  | "TRADER_SIMULATION"
  | "FOLLOWER_PROFIT"
  | "MANUAL_ADJUSTMENT";

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
  availableBalance: number;
  copiedTrader?: CopiedTrader;
}

export interface UpdateCopyTradingResponse {
  success: boolean;
  message: string;
  availableBalance: number;
  copiedTrader: CopiedTrader;
}

export interface CopyTradingSummary {
  active: number;
  paused: number;
  stopped: number;
}

export interface ExecutionFeedEvent {
  id: string;
  eventType: ExecutionEventType;
  description: string;
  amount: number;
  symbol?: string;
  traderDisplayName?: string | null;
  traderCode?: string | null;
  createdAt: string;
}

export interface ExecutionFeedResult {
  events: ExecutionFeedEvent[];
  latestCursor: string | null;
  count: number;
}

export interface WithdrawalRequest {
  amount: number;
  description: string;
}

export interface WithdrawalResponse {
  transaction_id: string;
  status: string;
  amount: number;
  description: string;
  created_at: string;
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
  available_balance: number;
  copied_trader?: BackendCopiedTrader | null;
};

type BackendUpdateResponse = {
  success: boolean;
  message: string;
  available_balance: number;
  copied_trader: BackendCopiedTrader;
};

type BackendSummaryResponse = {
  active: number;
  paused: number;
  stopped: number;
};

type BackendExecutionFeedEvent = {
  id: string;
  event_type: ExecutionEventType;
  description: string;
  amount: number | null;
  symbol?: string | null;
  trader_display_name?: string | null;
  trader_code?: string | null;
  created_at: string;
};

type BackendExecutionFeedResponse = {
  data: BackendExecutionFeedEvent[];
  count: number;
  latest_cursor?: string | null;
};

type BackendWithdrawalResponse = {
  transaction_id: string;
  status: string;
  amount: number;
  description: string;
  created_at: string;
};

const apiBase = () => (OpenAPI.BASE ?? "").replace(/\/$/, "");

const resolveToken = async (): Promise<string | undefined> => {
  const tokenGetter = OpenAPI.TOKEN;
  if (typeof tokenGetter === "function") {
    // Create a mock ApiRequestOptions object
    const mockOptions = {
      url: "",
      method: "GET" as const,
    };
    const token = await tokenGetter(mockOptions);
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

const mapExecutionFeedEvent = (payload: BackendExecutionFeedEvent): ExecutionFeedEvent => ({
  id: payload.id,
  eventType: payload.event_type,
  description: payload.description,
  amount: typeof payload.amount === "number" ? payload.amount : 0,
  symbol: payload.symbol ?? undefined,
  traderDisplayName: payload.trader_display_name ?? undefined,
  traderCode: payload.trader_code ?? undefined,
  createdAt: payload.created_at,
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
      availableBalance: payload.available_balance,
      copiedTrader: payload.copied_trader ? mapCopiedTrader(payload.copied_trader) : undefined,
    };
  }

  static async pauseCopyTrading(copyId: string): Promise<UpdateCopyTradingResponse> {
    const payload = await authorizedFetch<BackendUpdateResponse>(
      `/api/v1/copy-trading/copied/${copyId}/pause`,
      {
        method: "POST",
      }
    );

    return {
      success: payload.success,
      message: payload.message,
      availableBalance: payload.available_balance,
      copiedTrader: mapCopiedTrader(payload.copied_trader),
    };
  }

  static async stopCopyTrading(copyId: string): Promise<UpdateCopyTradingResponse> {
    const payload = await authorizedFetch<BackendUpdateResponse>(
      `/api/v1/copy-trading/copied/${copyId}/stop`,
      {
        method: "POST",
      }
    );

    return {
      success: payload.success,
      message: payload.message,
      availableBalance: payload.available_balance,
      copiedTrader: mapCopiedTrader(payload.copied_trader),
    };
  }

  static async resumeCopyTrading(copyId: string): Promise<UpdateCopyTradingResponse> {
    const payload = await authorizedFetch<BackendUpdateResponse>(
      `/api/v1/copy-trading/copied/${copyId}/resume`,
      {
        method: "POST",
      }
    );

    return {
      success: payload.success,
      message: payload.message,
      availableBalance: payload.available_balance,
      copiedTrader: mapCopiedTrader(payload.copied_trader),
    };
  }

  static async getCopyTradingSummary(): Promise<CopyTradingSummary> {
    const payload = await authorizedFetch<BackendSummaryResponse>(
      "/api/v1/copy-trading/summary",
      {
        method: "GET",
      }
    );

    return payload;
  }

  static async getExecutionFeed(params?: { limit?: number; since?: string }): Promise<ExecutionFeedResult> {
    const searchParams = new URLSearchParams();
    if (params?.limit) {
      searchParams.set("limit", String(params.limit));
    }
    if (params?.since) {
      searchParams.set("since", params.since);
    }
    const query = searchParams.toString();
    const payload = await authorizedFetch<BackendExecutionFeedResponse>(
      `/api/v1/copy-trading/executions${query ? `?${query}` : ""}`,
      {
        method: "GET",
      }
    );

    return {
      events: payload.data.map(mapExecutionFeedEvent),
      latestCursor: payload.latest_cursor ?? null,
      count: payload.count,
    };
  }

  static async copyTradingRequestWithdrawal(
    requestBody: WithdrawalRequest,
  ): Promise<WithdrawalResponse> {
    const payload = await authorizedFetch<BackendWithdrawalResponse>(
      "/api/v1/admin/simulations/withdrawals/request",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      }
    );

    return payload;
  }
}
