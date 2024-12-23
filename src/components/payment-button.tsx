import { useState } from "react";
import config from "@/config";
import { apiClient } from "../lib/api-client";
import { useUser } from "@clerk/nextjs";

export default function PaymentButton() {
  const [loading, setLoading] = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const { user } = useUser();

  const handlePayment = async () => {
    if (!selectedPriceId) {
      alert("Please select a price");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient("/api/stripe/create-payment-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: selectedPriceId,
          email: user?.emailAddresses[0].emailAddress,
        }),
      });

      if (response.url) {
        console.log("data", response);
        window.location.href = response.url;
      } else {
        console.error("Error:", response.error);
        alert("Failed to create payment link");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Selecione um crédito adicional</h3>
      {config.stripe.additionalPlans.length > 0 ? (
        <ul>
          {config.stripe.additionalPlans.map((price) => (
            <li key={price.priceId}>
              <label>
                <input
                  type="radio"
                  name="price"
                  value={price.priceId}
                  onChange={() => setSelectedPriceId(price.priceId)}
                />
                {price.name} - R${price.price.toFixed(2).replace('.', ',')}
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <p>Carregando...</p>
      )}

      <button onClick={handlePayment} disabled={loading || !selectedPriceId}>
        {loading ? "Processando..." : "Pagar agora"}
      </button>
    </div>
  );
}
