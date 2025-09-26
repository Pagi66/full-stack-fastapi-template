import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { useAuth } from "@/providers/auth-provider";
import {
  CopyTradingService,
  type CopiedTrader,
  type StartCopyTradingResponse,
  type VerifyTraderResponse,
} from "@/api/services/CopyTradingService";
import { Users03 } from "@untitledui/icons";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const getRiskColor = (riskLevel: "LOW" | "MEDIUM" | "HIGH") => {
  switch (riskLevel) {
    case "LOW":
      return "success" as const;
    case "MEDIUM":
      return "warning" as const;
    case "HIGH":
      return "error" as const;
    default:
      return "brand" as const;
  }
};

export const CopyTrading = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [traderCode, setTraderCode] = useState("");
  const [allocationAmount, setAllocationAmount] = useState("");
  const [verificationResult, setVerificationResult] = useState<VerifyTraderResponse | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  const copiedTradersQuery = useQuery<CopiedTrader[]>({
    queryKey: ["copied-traders"],
    queryFn: () => CopyTradingService.getCopiedTraders(),
  });

  const verifyTraderMutation = useMutation<VerifyTraderResponse, Error, string>({
    mutationFn: (code) => CopyTradingService.verifyTraderCode(code),
    onSuccess: (data) => {
      if (data.valid && data.trader) {
        setVerificationResult(data);
        setAlertMessage(null);
        setAlertType("success");
      } else {
        setVerificationResult(null);
        setAlertMessage(data.message ?? "Trader code not found. Please verify and try again.");
        setAlertType("error");
      }
    },
    onError: (error) => {
      setVerificationResult(null);
      setAlertMessage(error.message || "Failed to verify trader code. Please try again.");
      setAlertType("error");
    },
  });

  const startCopyTradingMutation = useMutation<
    StartCopyTradingResponse,
    Error,
    { traderId: string; amount: number }
  >({
    mutationFn: ({ traderId, amount }) =>
      CopyTradingService.startCopyTrading({ traderId, allocation: amount }),
    onSuccess: (data) => {
      setAlertMessage(data.message);
      setAlertType("success");
      setTraderCode("");
      setAllocationAmount("");
      setVerificationResult(null);
      queryClient.invalidateQueries({ queryKey: ["copied-traders"] });
    },
    onError: (error) => {
      setAlertMessage(error.message || "Failed to start copy trading. Please try again.");
      setAlertType("error");
    },
  });

  const handleVerifyTrader = () => {
    if (!traderCode.trim()) {
      setAlertMessage("Please enter a trader code");
      setAlertType("error");
      return;
    }

    verifyTraderMutation.mutate(traderCode.trim().toUpperCase());
  };

  const handleStartCopyTrading = () => {
    if (!verificationResult?.valid || !verificationResult.trader) {
      setAlertMessage("Please verify a valid trader code before starting copy trading");
      setAlertType("error");
      return;
    }

    const amount = parseFloat(allocationAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      setAlertMessage("Please enter a valid allocation amount");
      setAlertType("error");
      return;
    }

    if (user?.balance && amount > user.balance) {
      setAlertMessage("Allocation amount exceeds your available balance");
      setAlertType("error");
      return;
    }

    startCopyTradingMutation.mutate({
      traderId: verificationResult.trader.id,
      amount,
    });
  };

  const copiedTraders = copiedTradersQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Copy Trading</h1>
          <p className="text-tertiary">Copy successful traders and automate your trading</p>
        </div>
        <Badge size="sm" color="brand">
          Available Balance: {formatCurrency(user?.balance || 0)}
        </Badge>
      </div>

      {alertMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg border p-4 ${
            alertType === "success"
              ? "border-success-200 bg-success-50 text-success-700"
              : "border-error-200 bg-error-50 text-error-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span>{alertMessage}</span>
            <button onClick={() => setAlertMessage(null)} className="text-sm hover:opacity-70">
              ✕
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-2xl border border-border-secondary bg-secondary p-6">
            <h2 className="mb-4 text-lg font-semibold text-primary">Start Copy Trading</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-primary">Trader Code</label>
                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="Enter trader code (e.g., ABC123)"
                    value={traderCode}
                    onChange={setTraderCode}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleVerifyTrader}
                    isLoading={verifyTraderMutation.isPending}
                    isDisabled={!traderCode.trim()}
                  >
                    Verify
                  </Button>
                </div>
              </div>

              {verificationResult?.valid && verificationResult.trader && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-lg border border-success-200 bg-success-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-success-700">
                        {verificationResult.trader.displayName}
                      </h3>
                      <p className="text-sm text-success-600">
                        {verificationResult.trader.specialty} • {verificationResult.trader.riskLevel} Risk
                      </p>
                      <p className="mt-1 text-xs text-success-500">
                        Performance: {verificationResult.trader.performance} • Win Rate: {verificationResult.trader.winRate}
                      </p>
                    </div>
                    <Badge color="success" size="sm">
                      Verified
                    </Badge>
                  </div>
                </motion.div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-primary">
                  Allocation Amount (USD)
                </label>
                <Input
                  type="number"
                  placeholder="Enter amount to allocate"
                  value={allocationAmount}
                  onChange={setAllocationAmount}
                  min={0}
                />
                <p className="mt-1 text-xs text-tertiary">Minimum allocation: $100.00</p>
              </div>

              <Button
                onClick={handleStartCopyTrading}
                isLoading={startCopyTradingMutation.isPending}
                isDisabled={!verificationResult?.valid || !allocationAmount}
                className="w-full"
              >
                Start Copy Trading
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border-secondary bg-secondary p-6">
            <h2 className="mb-4 text-lg font-semibold text-primary">How Copy Trading Works</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {["Find a Trader", "Set Allocation", "Automate Trading"].map((title, index) => (
                <div key={title} className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
                    <span className="font-semibold text-brand-600">{index + 1}</span>
                  </div>
                  <h3 className="mb-2 font-medium text-primary">{title}</h3>
                  <p className="text-sm text-tertiary">
                    {index === 0 && "Get a trader code from a successful trader you want to copy"}
                    {index === 1 && "Choose how much capital to allocate for copying their trades"}
                    {index === 2 && "All trades will be automatically copied to your account"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-2xl border border-border-secondary bg-secondary p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">Traders You're Copying</h2>
              <Badge color="brand" size="sm">
                {copiedTraders.length} Active
              </Badge>
            </div>

            {copiedTradersQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-brand-600" />
              </div>
            ) : copiedTraders.length === 0 ? (
              <div className="py-8 text-center">
                <Users03 className="mx-auto mb-3 h-12 w-12 text-tertiary" />
                <p className="text-sm text-tertiary">You're not copying any traders yet</p>
                <p className="mt-1 text-xs text-tertiary">Start by entering a trader code above</p>
              </div>
            ) : (
              <div className="space-y-4">
                {copiedTraders.map((trader) => (
                  <motion.div
                    key={trader.copyId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-secondary p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold text-primary">{trader.displayName}</h3>
                      <Badge color={getRiskColor(trader.riskLevel)} size="sm">
                        {trader.riskLevel}
                      </Badge>
                    </div>
                    <p className="mb-2 text-sm text-tertiary">{trader.specialty}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-tertiary">Allocation:</span>
                        <div className="font-medium text-primary">{formatCurrency(trader.allocation)}</div>
                      </div>
                      <div>
                        <span className="text-tertiary">Performance:</span>
                        <div
                          className={`font-medium ${
                            trader.performance.startsWith("-") ? "text-error-600" : "text-success-600"
                          }`}
                        >
                          {trader.performance}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-tertiary">Win Rate: {trader.winRate}</span>
                      <Badge color="success" size="sm">
                        {trader.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border-secondary bg-secondary p-6">
            <h3 className="mb-3 font-semibold text-primary">Benefits of Copy Trading</h3>
            <ul className="space-y-2 text-sm text-tertiary">
              {["Automated expert strategies", "Diversify your portfolio", "No trading experience required", "Real-time trade execution"].map(
                (item) => (
                  <li key={item} className="flex items-center">
                    <span className="mr-2 h-2 w-2 rounded-full bg-success-500" />
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

