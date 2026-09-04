"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCurrentAccount,useDAppKit} from "@mysten/dapp-kit-react";
import dynamic from "next/dynamic";
import { Transaction } from "@mysten/sui/transactions";



const ConnectModal = dynamic(
  () =>
    import("@mysten/dapp-kit-react/ui").then(
      (mod) => mod.ConnectModal
    ),
  {
    ssr: false,
  }
);

interface PaymentData {
  id: string;
  amount: string;
  description: string;
  merchant: string;
  status: string;
  created_at: string;
  merchant_wallet: string;
  transaction_digest: string | null;
}

export default function PaymentPage() {
  const params = useParams();
  const paymentId = params.id as string;

  const currentAccount = useCurrentAccount();
  const dAppKit = useDAppKit();

  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  

  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (currentAccount) {
      setWalletModalOpen(false);
    }
  }, [currentAccount]);

  useEffect(() => {
    const getPayment = async () => {
      if (!paymentId) return;

      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("id", paymentId)
        .single();

      if (error) {
        console.error(error);
      } else {
        setPayment(data);
      }

      setLoading(false);
    };

    getPayment();
  }, [paymentId]);

  const handlePayment = async () => {
    if (!currentAccount) {
      setWalletModalOpen(true);
      return;
    }

    if (!payment) return;

    // Prevent duplicate payment
    if (payment.status === "completed") {
      alert("This payment has already been completed.");
      return;
    }

    try {
      setIsPaying(true);

      // Merchant wallet address
      const MERCHANT_WALLET = payment.merchant_wallet;

      const tx = new Transaction();

        // 1 SUI = 1,000,000,000 MIST
        const amountInMist = BigInt(
          Math.round(parseFloat(payment.amount) * 1_000_000_000)
        );

        const [coin] = tx.splitCoins(
          tx.gas,
          [amountInMist]
        );

        // Transfer SUI
        tx.transferObjects(
          [coin],
          MERCHANT_WALLET
      );

      const result = await dAppKit.signAndExecuteTransaction({
        transaction: tx,
      });

      if (result.FailedTransaction) {
        throw new Error(
          result.FailedTransaction.status.error?.message ||
            "Transaction failed"
        );
      }

      console.log(
        "Transaction successful:",
        result.Transaction.digest
      );

      const { error } = await supabase
        .from("payments")
        .update({
          status: "completed",
          transaction_digest: result.Transaction.digest,
        })
        .eq("id", payment.id);

      if (error) {
        console.error("Failed to update payment:", error);
      } else {
        // Update the page immediately
        setPayment({
          ...payment,   //spread operator（展开运算符）,把原本 payment 对象里面的所有东西复制过来
          status: "completed",
          transaction_digest: result.Transaction.digest,
        });
      }

      alert(
        `Payment successful!\nTransaction: ${result.Transaction.digest}`
      );
    } catch (error) {
      console.error("Payment failed:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Payment failed"
      );
    } finally {
      setIsPaying(false);
    }
  };

  // show loading state while fetching payment data
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading payment...</p>
      </main>
    );
  }

  if (!payment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="rounded-xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-red-500">
            Payment Not Found
          </h1>

          <p className="mt-3 text-gray-500">
            This payment request does not exist.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">
            SuiPay
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Secure crypto payment
          </p>
        </div>

        {/* Payment Details */}
        <div className="rounded-xl bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-500">
            You are paying
          </p>

          <h2 className="mt-2 text-4xl font-bold text-gray-900">
            {payment.amount} SUI
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Testnet SUI
          </p>

          <p className="mt-3 font-medium text-gray-700">
            {payment.description}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Merchant: {payment.merchant}
          </p>
        </div>

        {/* Payment ID */}
        <div className="mt-6">
          <p className="text-sm text-gray-500">
            Payment ID
          </p>

          <p className="mt-1 break-all rounded-lg bg-gray-100 p-3 text-sm text-gray-700">
            {payment.id}
          </p>
        </div>

        {/* Wallet Button */}
        <button
          onClick={() => {
            if (!currentAccount) {
              setWalletModalOpen(true);
            }
          }}
          className="mt-8 w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          {currentAccount
            ? `${currentAccount.address.slice(0, 6)}...${currentAccount.address.slice(-4)}`
            : "Connect Wallet"}
        </button>

        <ConnectModal open={walletModalOpen} />

        {/* Pay Button */}
        <button 
          onClick={handlePayment} 
          disabled={isPaying || payment.status === "completed"} 
          className="mt-3 w-full rounded-lg border border-blue-600 py-3 font-medium text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50" 
        >
          {payment.status === "completed"
            ? "Payment Completed"
            : isPaying
            ? "Processing Payment..."
            : `Pay ${payment.amount} Testnet SUI`}
        </button>

        {payment.status === "completed" && payment.transaction_digest && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-5">

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <span className="text-2xl text-green-600">
                  ✓
                </span>
              </div>

              <h3 className="mt-3 text-lg font-semibold text-green-700">
                Payment Successful
              </h3>

              <p className="mt-1 text-sm text-green-600">
                Your payment has been confirmed on Sui Testnet.
              </p>
            </div>

            <div className="mt-4 rounded-lg bg-white p-3">
              <p className="text-xs font-medium text-gray-500">
                Transaction Digest
              </p>

              <p className="mt-1 break-all text-xs text-gray-700">
                {payment.transaction_digest}
              </p>
            </div>

            <a
              href={`https://suiscan.xyz/testnet/tx/${payment.transaction_digest}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block w-full rounded-lg bg-blue-600 py-2.5 text-center text-sm font-medium text-white transition hover:bg-blue-700"
            >
              View Transaction →
            </a>

          </div>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">
          Powered by Sui Network
        </p>
      </div>
    </main>
  );
}