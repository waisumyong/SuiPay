"use client";

import { useEffect,useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/lib/supabase";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import dynamic from "next/dynamic";

const ConnectModal = dynamic(
  () =>
    import("@mysten/dapp-kit-react/ui").then(
      (mod) => mod.ConnectModal
    ),
  {
    ssr: false,
  }
);

export default function Home() {
  const currentAccount = useCurrentAccount();

  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAllPayments, setShowAllPayments] = useState(false);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  const hour = new Date().getHours();

  const greeting =
    hour >= 5 && hour < 12
      ? "Good morning"
      : hour >= 12 && hour < 18
      ? "Good afternoon"
      : "Good evening";


  useEffect(() => {
    if (currentAccount) {
      setWalletModalOpen(false);
    }
  }, [currentAccount]);

  useEffect(() => {
    const getPayments = async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load payments:", error);
      } else {
        setPayments(data || []);
      }

      setLoadingPayments(false);
    };

    // Load payments immediately
    getPayments();

    // Refresh payments every 5 seconds
    const interval = setInterval(() => {
      getPayments();
    }, 5000);

    // Stop refreshing when leaving the page
    return () => clearInterval(interval);
  }, []);


  const createPayment = async () => {
    if (!currentAccount) {
      setWalletModalOpen(true);
      return;
    }

    if (!amount) {
      alert("Please enter an amount");
      return;
    }

    const paymentId = Math.random().toString(36).substring(2, 10);

    const { error } = await supabase.from("payments").insert({
      id: paymentId,
      amount: amount,
      description: description || "Payment",
      merchant: "Demo Merchant",
      merchant_wallet: currentAccount.address,
      status: "pending",
    });

    if (error) {
      console.error(error);
      alert("Failed to create payment");
      return;
    }

    const link = `${window.location.origin}/pay/${paymentId}`;    //`${window.location.origin}/pay/${paymentId}`,`http://192.168.137.1:3000/pay/${paymentId}`

    setPaymentLink(link);

    setPayments((prev) => [
      {
        id: paymentId,
        amount: amount,
        description: description || "Payment",
        merchant: "Demo Merchant",
        merchant_wallet: currentAccount.address,
        status: "pending",
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const closeModal = () => {
    setShowModal(false);
    setAmount("");
    setDescription("");
    setPaymentLink("");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <ConnectModal open={walletModalOpen} />
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-blue-600">
            SuiPay
          </h1>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Merchant Dashboard
            </span>

            <button
              onClick={() => {
                if (!currentAccount) {
                  setWalletModalOpen(true);
                }
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              {currentAccount
                ? `${currentAccount.address.slice(0, 6)}...${currentAccount.address.slice(-4)}`
                : "Connect Wallet"}
            </button>
          </div>
        </div>
      </nav>

      {/* Dashboard */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {greeting} 👋
            </h2>

            <p className="mt-2 text-gray-500">
              Manage your crypto payments in one place.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            + Create Payment
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Today's Revenue
            </p>

            <h3 className="mt-2 text-3xl font-bold text-gray-900">
              {payments
                .filter(
                  (payment) =>
                    payment.status === "completed" &&
                    new Date(payment.created_at).toDateString() ===
                      new Date().toDateString()
                )
                .reduce(
                  (total, payment) => total + parseFloat(payment.amount),
                  0
                )
                .toFixed(2)} SUI
            </h3>

            <p className="mt-2 text-sm text-green-600">
              +12.5% from yesterday
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Payments
            </p>

            <h3 className="mt-2 text-3xl font-bold text-gray-900">
              {payments.length}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              All payment requests
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Settlement Status
            </p>

            <h3 className="mt-2 text-3xl font-bold text-green-600">
              Live
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Sui network connected
            </p>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              Recent Payments
            </h3>

            <button 
              onClick={() => setShowAllPayments(true)}
              className="text-sm font-medium text-blue-600"
            >
              View all →
            </button>
          </div>

        <div className="space-y-4">
          {loadingPayments ? (
            <p className="text-sm text-gray-500">
              Loading payments...
            </p>
          ) : payments.length === 0 ? (
            <p className="text-sm text-gray-500">
              No payments yet.
            </p>
          ) : (
            payments.slice(0, 5).map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between border-b pb-4"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    Payment #{payment.id}
                  </p>

                  <p className="text-sm text-gray-500">
                    SUI · {payment.description}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    +{payment.amount} SUI
                  </p>

                  <p
                    className={`text-sm ${
                      payment.status === "completed"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {payment.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        </div>
      </div>

      {/* Create Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {!paymentLink ? (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Create Payment
                  </h2>

                  <button
                    onClick={closeModal}
                    className="text-xl text-gray-500"
                  >
                    ✕
                  </button>
                </div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Amount (SUI)
                </label>

                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.01"
                  className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Coffee payment"
                  className="mb-6 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />

                <button
                  onClick={createPayment}
                  className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700"
                >
                  Create Payment Request
                </button>
              </>
            ) : (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Payment Request Created 🎉
                </h2>

                <p className="mt-2 text-gray-500">
                  Amount: {amount} SUI
                </p>

                {description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {description}
                  </p>
                )}

                <div className="my-6 flex justify-center">
                  <QRCodeSVG
                    value={paymentLink}
                    size={220}
                  />
                </div>

                <p className="break-all text-sm text-gray-500">
                  {paymentLink}
                </p>

                <button
                  onClick={closeModal}
                  className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Payments Modal */}
      {showAllPayments && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              All Payments
            </h2>

            <button
              onClick={() => setShowAllPayments(false)}
              className="text-xl text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {payments.length === 0 ? (
            <p className="text-center text-gray-500">
              No payments yet.
            </p>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between">

                    <div>
                      <p className="font-semibold text-gray-900">
                        Payment #{payment.id}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {payment.description}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(payment.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        +{payment.amount} SUI
                      </p>

                      <p
                        className={`mt-1 text-sm ${
                          payment.status === "completed"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {payment.status}
                      </p>
                    </div>

                  </div>

                  {payment.transaction_digest && (
                    <div className="mt-3 rounded-lg bg-gray-50 p-3">
                      <p className="break-all text-xs text-gray-500">
                        Transaction: {payment.transaction_digest}
                      </p>

                      <a
                        href={`https://suiscan.xyz/testnet/tx/${payment.transaction_digest}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        View Transaction  →
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    )}
    </main>
  );
}