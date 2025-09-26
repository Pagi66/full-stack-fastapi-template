import { useState, ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/base/buttons/button";
import { NativeSelect } from "@/components/base/select/select-native";
import { Badge } from "@/components/base/badges/badges";
import { useClipboard } from "@/hooks/use-clipboard";
import { TraderService } from "@/api/services/TraderService";
import { UsersService } from "@/api/services/UsersService";
import type { UserPublic } from "@/api/models/UserPublic";
import { CheckCircle, Copy01 } from "@untitledui/icons";

const specialtyOptions = [
  { value: "forex", label: "Forex" },
  { value: "crypto", label: "Cryptocurrency" },
  { value: "stocks", label: "Stocks" },
  { value: "indices", label: "Indices" }
];

const riskLevelOptions = [
  { value: "LOW", label: "Low Risk" },
  { value: "MEDIUM", label: "Medium Risk" },
  { value: "HIGH", label: "High Risk" }
];


export const TraderManager = () => {
  const queryClient = useQueryClient();
  const { copy } = useClipboard();
  const [formData, setFormData] = useState({
    userId: "",
    displayName: "",
    specialty: "",
    riskLevel: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    isPublic: false,
    copyFeePercentage: 0.0,
    minimumCopyAmount: 100.0
  });
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch users for the user selection dropdown
  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => UsersService.usersReadUsers(0, 100),
  });

  const users = usersQuery.data?.data ?? [];

  const createTraderMutation = useMutation({
    mutationFn: (traderData: any) => TraderService.tradersCreateTrader(traderData),
    onSuccess: (data) => {
      setGeneratedCode(data.trader_code);
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['admin-traders'] });
      
      // Reset form after successful submission (longer timeout to allow user to copy code)
      setTimeout(() => {
        setFormData({
          userId: "",
          displayName: "",
          specialty: "",
          riskLevel: "MEDIUM",
          isPublic: false,
          copyFeePercentage: 0.0,
          minimumCopyAmount: 100.0
        });
        setShowSuccess(false);
      }, 15000); // Increased from 5 to 15 seconds
    },
    onError: (error: any) => {
      console.error("Error creating trader:", error);
      // Try to extract more detailed error message from the response
      const errorMessage = error?.response?.data?.detail || 
                          error?.message || 
                          error?.toString() || 
                          'Unknown error occurred';
      alert(`Failed to create trader: ${errorMessage}`);
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.displayName || !formData.specialty) {
      alert("Please fill in all required fields");
      return;
    }

    const traderData = {
      user_id: formData.userId, // This should be sent as UUID string, which it already is
      display_name: formData.displayName,
      specialty: formData.specialty,
      risk_level: formData.riskLevel,
      is_public: formData.isPublic,
      copy_fee_percentage: formData.copyFeePercentage,
      minimum_copy_amount: formData.minimumCopyAmount
    };

    console.log("Sending trader data:", traderData);
    createTraderMutation.mutate(traderData);
  };

  const handleCopyCode = async () => {
    if (generatedCode) {
      await copy(generatedCode);
      // You could add a toast notification here
    }
  };

  const isSubmitting = createTraderMutation.isPending;

  return (
    <div className="min-h-screen bg-bg-secondary p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-display-sm font-semibold text-fg-primary">Trader Manager</h1>
          <p className="text-md text-fg-tertiary mt-2">
            Create and manage trader profiles for copy trading functionality.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Create Trader Form */}
          <div className="rounded-lg border border-border-secondary bg-bg-primary p-6 shadow-xs">
            <h2 className="text-lg font-semibold text-fg-primary mb-4">Create New Trader</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Selection */}
              <div>
                <label className="block text-sm font-medium text-fg-primary mb-2">
                  Select User *
                </label>
                <NativeSelect
                  value={formData.userId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => handleInputChange("userId", e.target.value)}
                  disabled={isSubmitting}
                  options={[
                    { value: "", label: "Select a user" },
                    ...users.map((user: UserPublic) => ({
                      value: user.id,
                      label: `${user.email} (${user.full_name || "No name"})`
                    }))
                  ]}
                />
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-fg-primary mb-2">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("displayName", e.target.value)}
                  placeholder="Enter trader display name"
                  disabled={isSubmitting}
                  required
                  className="w-full rounded-lg border border-border-secondary bg-bg-primary px-3 py-2 text-md text-fg-primary placeholder:text-fg-tertiary focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-disabled_subtle disabled:text-disabled"
                />
              </div>

              {/* Specialty */}
              <div>
                <label className="block text-sm font-medium text-fg-primary mb-2">
                  Trading Specialty *
                </label>
                <NativeSelect
                  value={formData.specialty}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => handleInputChange("specialty", e.target.value)}
                  disabled={isSubmitting}
                  options={[
                    { value: "", label: "Select specialty" },
                    ...specialtyOptions
                  ]}
                />
              </div>

              {/* Risk Level */}
              <div>
                <label className="block text-sm font-medium text-fg-primary mb-2">
                  Risk Level
                </label>
                <NativeSelect
                  value={formData.riskLevel}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => handleInputChange("riskLevel", e.target.value)}
                  disabled={isSubmitting}
                  options={riskLevelOptions}
                />
              </div>

              {/* Advanced Options */}
              <div className="space-y-3 pt-4 border-t border-border-secondary">
                <h3 className="text-sm font-medium text-fg-primary">Advanced Options</h3>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("isPublic", e.target.checked)}
                    disabled={isSubmitting}
                    className="rounded border-border-secondary text-brand-600 focus:ring-brand-500"
                  />
                  <label htmlFor="isPublic" className="text-sm text-fg-primary">
                    Make trader public (available for copy trading)
                  </label>
                </div>

                {formData.isPublic && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-fg-primary mb-1">
                        Copy Fee Percentage
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.copyFeePercentage}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("copyFeePercentage", parseFloat(e.target.value) || 0)}
                        placeholder="0.0"
                        disabled={isSubmitting}
                        className="w-full rounded-lg border border-border-secondary bg-bg-primary px-3 py-2 text-md text-fg-primary placeholder:text-fg-tertiary focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-disabled_subtle disabled:text-disabled"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-fg-primary mb-1">
                        Minimum Copy Amount ($)
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={formData.minimumCopyAmount}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("minimumCopyAmount", parseFloat(e.target.value) || 100)}
                        placeholder="100.0"
                        disabled={isSubmitting}
                        className="w-full rounded-lg border border-border-secondary bg-bg-primary px-3 py-2 text-md text-fg-primary placeholder:text-fg-tertiary focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-disabled_subtle disabled:text-disabled"
                      />
                    </div>
                  </>
                )}
              </div>

              <Button
                type="submit"
                color="primary"
                disabled={isSubmitting || !formData.userId || !formData.displayName || !formData.specialty}
                className="w-full"
              >
                {isSubmitting ? "Creating Trader..." : "Create Trader Profile"}
              </Button>
            </form>
          </div>

          {/* Success Message & Generated Code */}
          <div className="space-y-6">
            {showSuccess && (
              <div className="rounded-lg border border-success-200 bg-success-50 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle className="size-5 text-success-600" />
                  <h3 className="text-lg font-semibold text-success-900">Trader Created Successfully!</h3>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm text-success-700">
                    The trader profile has been created successfully. Share the trader code with the user:
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <Badge type="color" size="lg" color="success" className="font-mono">
                      {generatedCode}
                    </Badge>
                    <Button
                      size="sm"
                      color="secondary"
                      onClick={handleCopyCode}
                      className="flex items-center space-x-1"
                    >
                      <Copy01 className="size-4" />
                      <span>Copy</span>
                    </Button>
                  </div>
                  
                  <p className="text-xs text-success-600">
                    This code will be used for trader identification and copy trading operations.
                  </p>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="rounded-lg border border-border-secondary bg-bg-primary p-6">
              <h3 className="text-lg font-semibold text-fg-primary mb-3">How to Create a Trader</h3>
              <div className="space-y-2 text-sm text-fg-secondary">
                <p>1. Select a user from the system who will become a trader</p>
                <p>2. Provide a display name that will be shown to other users</p>
                <p>3. Choose the trader's specialty and risk level</p>
                <p>4. Optionally make the trader public for copy trading</p>
                <p>5. A unique 6-8 character trader code will be generated</p>
              </div>
            </div>

            {/* Status */}
            <div className="rounded-lg border border-border-secondary bg-bg-primary p-6">
              <h3 className="text-lg font-semibold text-fg-primary mb-3">Current Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-fg-secondary">Form Ready:</span>
                  <Badge 
                    type="color" 
                    size="sm" 
                    color={formData.userId && formData.displayName && formData.specialty ? "success" : "warning"}
                  >
                    {formData.userId && formData.displayName && formData.specialty ? "Ready" : "Incomplete"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-fg-secondary">API Status:</span>
                  <Badge type="color" size="sm" color="brand">
                    Connected
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
