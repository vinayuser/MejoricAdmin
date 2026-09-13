import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useGetQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import axiosInstance from "../../api/axiosInstance";
import Loader from "../../components/UI/Loader";
import Table from "../../components/UI/Table";
import { formatDate, formatDateTime } from "../../utils/formatters";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const CYCLE_LABELS = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  half_yearly: "Half-yearly",
  yearly: "Annual",
  one_time: "One-time",
};

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  partially_paid: "bg-orange-100 text-orange-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-slate-100 text-slate-600",
  draft: "bg-slate-100 text-slate-600",
};

const StatusBadge = ({ status }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
    {(status || "pending").replace(/_/g, " ")}
  </span>
);

const StatCard = ({ label, value, sub }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4">
    <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
    <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
    {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
  </div>
);

const PaymentModal = ({ invoice, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    amount: String(invoice.balanceDue ?? ""),
    method: "bank_transfer",
    reference: "",
    notes: "",
    paidAt: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid payment amount");
      return;
    }
    setSaving(true);
    try {
      const url = API_ENDPOINTS.CORPORATE.RECORD_PAYMENT.replace(
        ":invoiceId",
        invoice._id,
      );
      await axiosInstance.post(url, {
        amount,
        method: form.method,
        reference: form.reference,
        notes: form.notes,
        paidAt: form.paidAt,
      });
      toast.success("Payment recorded");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to record payment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-slate-900">Record payment</h3>
        <p className="text-sm text-slate-500 mt-1">
          {invoice.invoiceNumber} · Balance due {money(invoice.balanceDue)}
        </p>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Method</label>
            <select
              value={form.method}
              onChange={(e) => setForm((p) => ({ ...p, method: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            >
              <option value="bank_transfer">Bank transfer</option>
              <option value="upi">UPI</option>
              <option value="cheque">Cheque</option>
              <option value="razorpay">Razorpay</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reference / UTR</label>
            <input
              value={form.reference}
              onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              placeholder="Transaction reference"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment date</label>
            <input
              type="date"
              value={form.paidAt}
              onChange={(e) => setForm((p) => ({ ...p, paidAt: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : "Record payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const toMonthValue = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

const monthLabel = (value) => {
  const [y, m] = value.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
};

/** Last 24 months + current + next 3 */
const buildMonthOptions = () => {
  const options = [];
  const now = new Date();
  for (let offset = -24; offset <= 3; offset += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const value = toMonthValue(d);
    options.push({
      value,
      label: monthLabel(value),
      isCurrent: offset === 0,
    });
  }
  return options.reverse();
};

const GenerateInvoiceModal = ({
  corporateId,
  platformFee,
  billingCycle,
  existingInvoices = [],
  onClose,
  onSuccess,
}) => {
  const monthOptions = buildMonthOptions();
  const billedMonths = new Set(
    existingInvoices
      .filter(
        (inv) =>
          inv.invoiceKind !== "onboarding" &&
          inv.billingCycle !== "one_time" &&
          inv.status !== "cancelled" &&
          inv.periodStart,
      )
      .map((inv) => toMonthValue(inv.periodStart)),
  );

  const defaultMonth =
    monthOptions.find((o) => o.isCurrent && !billedMonths.has(o.value))?.value ||
    monthOptions.find((o) => !billedMonths.has(o.value))?.value ||
    monthOptions.find((o) => o.isCurrent)?.value ||
    monthOptions[0]?.value;

  const [periodMonth, setPeriodMonth] = useState(defaultMonth);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const alreadyBilled = billedMonths.has(periodMonth);

  const submit = async (e) => {
    e.preventDefault();
    if (!periodMonth) {
      toast.error("Select a billing month");
      return;
    }
    if (alreadyBilled) {
      toast.error(`An invoice already exists for ${monthLabel(periodMonth)}`);
      return;
    }
    if (!Number(platformFee)) {
      toast.error("Set a monthly platform fee on the contract before generating invoices");
      return;
    }

    setSaving(true);
    try {
      const url = API_ENDPOINTS.CORPORATE.GENERATE_INVOICE.replace(
        ":id",
        corporateId,
      );
      await axiosInstance.post(url, {
        periodMonth,
        billingCycle: billingCycle || "monthly",
        invoiceKind: "subscription",
        notes: notes.trim() || undefined,
      });
      toast.success(`Invoice created for ${monthLabel(periodMonth)}. Email sent to owner.`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to generate invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-slate-900">Generate invoice</h3>
        <p className="text-sm text-slate-500 mt-1">
          Create a subscription invoice for any past or future billing month.
          Amount: {money(platformFee)} ({CYCLE_LABELS[billingCycle] || billingCycle}).
        </p>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Billing month
            </label>
            <select
              value={periodMonth}
              onChange={(e) => setPeriodMonth(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                  {opt.isCurrent ? " (current)" : ""}
                  {billedMonths.has(opt.value) ? " — already invoiced" : ""}
                </option>
              ))}
            </select>
            {alreadyBilled && (
              <p className="mt-1.5 text-xs text-amber-700">
                This month already has a subscription invoice. Pick another month,
                or cancel the existing one first.
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              placeholder={`Subscription — ${monthLabel(periodMonth)}`}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || alreadyBilled}
              className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm disabled:opacity-50"
            >
              {saving ? "Generating..." : "Generate invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const METHOD_LABELS = {
  bank_transfer: "Bank transfer",
  upi: "UPI",
  cheque: "Cheque",
  razorpay: "Razorpay",
  cash: "Cash",
  other: "Other",
};

const InvoiceViewModal = ({ invoice, corporate, onClose, onRecordPayment }) => {
  const isOnboarding =
    invoice.invoiceKind === "onboarding" || invoice.billingCycle === "one_time";
  const lineItems = invoice.lineItems || [];
  const payments = invoice.payments || [];
  const balanceDue =
    invoice.balanceDue ??
    Math.max(0, (invoice.totalAmount || 0) - (invoice.amountPaid || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {isOnboarding ? "Onboarding tax invoice" : "Subscription tax invoice"}
            </p>
            <h3 className="text-xl font-semibold text-slate-900 mt-0.5">
              {invoice.invoiceNumber}
            </h3>
            <p className="text-sm text-slate-500 mt-1">{corporate?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={invoice.status} />
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-sm text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              From (supplier)
            </p>
            <p className="mt-1 font-semibold text-slate-900">Mejoric</p>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              GSTIN &amp; address on emailed invoices come from server env{" "}
              <code className="text-[10px]">MEJORIC_GSTIN</code> /{" "}
              <code className="text-[10px]">MEJORIC_BILLING_ADDRESS</code>.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Bill to (customer)
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {corporate?.name || "—"}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              <span className="text-slate-500">GSTIN:</span>{" "}
              {corporate?.gstNumber || (
                <span className="text-amber-700">Not set — add in Edit contract</span>
              )}
            </p>
            {corporate?.billingAddress ? (
              <p className="mt-1 text-sm text-slate-600 whitespace-pre-line">
                {corporate.billingAddress}
              </p>
            ) : (
              <p className="mt-1 text-sm text-amber-700">
                Billing address not set — add in Edit contract
              </p>
            )}
            {corporate?.billingContactEmail && (
              <p className="mt-1 text-xs text-slate-500">
                {corporate.billingContactEmail}
                {corporate.billingContactPhone
                  ? ` · ${corporate.billingContactPhone}`
                  : ""}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-[11px] uppercase text-slate-500">Period</p>
            <p className="text-sm font-medium text-slate-900 mt-1">
              {isOnboarding
                ? "One-time"
                : `${formatDate(invoice.periodStart)} – ${formatDate(invoice.periodEnd)}`}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-[11px] uppercase text-slate-500">Cycle</p>
            <p className="text-sm font-medium text-slate-900 mt-1">
              {CYCLE_LABELS[invoice.billingCycle] || invoice.billingCycle}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-[11px] uppercase text-slate-500">Due date</p>
            <p className="text-sm font-medium text-slate-900 mt-1">
              {formatDate(invoice.dueDate)}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-[11px] uppercase text-slate-500">Balance due</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {money(balanceDue)}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-semibold text-slate-900 mb-2">Line items</h4>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 font-medium text-right">Qty</th>
                  <th className="px-3 py-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineItems.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-4 text-center text-slate-400">
                      No line items
                    </td>
                  </tr>
                ) : (
                  lineItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2.5 text-slate-700">
                        <div>{item.description}</div>
                        <div className="text-[11px] text-slate-400 capitalize">
                          {(item.type || "").replace(/_/g, " ")}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-600">
                        {item.quantity ?? 1}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium text-slate-900">
                        {money(item.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 ml-auto w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{money(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST ({invoice.taxPercent ?? 18}%)</span>
              <span>{money(invoice.taxAmount)}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-900 border-t border-slate-200 pt-1.5">
              <span>Total</span>
              <span>{money(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-700">
              <span>Paid</span>
              <span>{money(invoice.amountPaid)}</span>
            </div>
            <div className="flex justify-between font-medium text-slate-900">
              <span>Balance due</span>
              <span>{money(balanceDue)}</span>
            </div>
          </div>
        </div>

        {(Number(invoice.minuteAllocation?.audio) > 0 ||
          Number(invoice.minuteAllocation?.video) > 0 ||
          Number(invoice.minuteAllocation?.chat) > 0) && (
          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="text-xs font-medium uppercase text-slate-500 mb-1">
              Included minute snapshot
            </p>
            <p className="text-slate-700">
              Audio {invoice.minuteAllocation?.audio ?? 0} · Video{" "}
              {invoice.minuteAllocation?.video ?? 0} · Chat{" "}
              {invoice.minuteAllocation?.chat ?? 0}
            </p>
          </div>
        )}

        <div className="mt-6">
          <h4 className="text-sm font-semibold text-slate-900 mb-2">Payment history</h4>
          {payments.length === 0 ? (
            <p className="text-sm text-slate-400">No payments recorded yet.</p>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Method</th>
                    <th className="px-3 py-2 font-medium">Reference</th>
                    <th className="px-3 py-2 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p, idx) => (
                    <tr key={p._id || idx}>
                      <td className="px-3 py-2.5 text-slate-700">
                        {formatDate(p.paidAt)}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">
                        {METHOD_LABELS[p.method] || p.method || "—"}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">
                        {p.reference || p.notes || "—"}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium text-slate-900">
                        {money(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {invoice.notes && (
          <p className="mt-4 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
            <span className="font-medium">Notes:</span> {invoice.notes}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
          >
            Close
          </button>
          {!["paid", "cancelled"].includes(invoice.status) && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onRecordPayment?.(invoice);
              }}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm"
            >
              Record payment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const CorporateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("overview");
  const [payInvoice, setPayInvoice] = useState(null);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const dashboardUrl = API_ENDPOINTS.CORPORATE.DASHBOARD.replace(":id", id);
  const usageUrl = `${API_ENDPOINTS.CORPORATE.USAGE.replace(":id", id)}?limit=50`;
  const membersUrl = `${API_ENDPOINTS.CORPORATE.MEMBERS.replace(":id", id)}?limit=50`;

  const { data, isPending, refetch } = useGetQuery(dashboardUrl, ["corporate-dashboard", id]);
  const { data: usageData, isPending: usageLoading } = useGetQuery(
    usageUrl,
    ["corporate-usage", id],
    { enabled: tab === "usage" },
  );
  const { data: membersData, isPending: membersLoading } = useGetQuery(
    membersUrl,
    ["corporate-members", id],
    { enabled: tab === "members" },
  );

  const dashboard = data?.data;
  const corp = dashboard?.corporate;
  const billing = dashboard?.billing;
  const invoices = dashboard?.invoices || [];
  const onboardingInvoices =
    dashboard?.onboardingInvoices ||
    invoices.filter((i) => i.invoiceKind === "onboarding" || i.billingCycle === "one_time");
  const subscriptionInvoices =
    dashboard?.subscriptionInvoices ||
    invoices.filter((i) => i.invoiceKind !== "onboarding" && i.billingCycle !== "one_time");
  const usageStats = dashboard?.usageStats;
  const recentUsage = dashboard?.recentUsage || [];

  const refresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["corporate-usage", id] });
    queryClient.invalidateQueries({ queryKey: ["corporates"] });
  };

  const handleCancelInvoice = async (invoice) => {
    if (!window.confirm(`Cancel invoice ${invoice.invoiceNumber}?`)) return;
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.CORPORATE.CANCEL_INVOICE}${invoice._id}`);
      toast.success("Invoice cancelled");
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel invoice");
    }
  };

  if (isPending) return <Loader />;
  if (!corp) {
    return (
      <div className="p-6">
        <p className="text-slate-600">Corporate account not found.</p>
        <button type="button" onClick={() => navigate("/corporate")} className="text-sm text-blue-600 mt-2">
          ← Back
        </button>
      </div>
    );
  }

  const invoiceColumns = [
    {
      key: "invoiceNumber",
      title: "Invoice #",
      render: (row) => (
        <button
          type="button"
          onClick={() => setViewInvoice(row)}
          className="font-medium text-slate-900 hover:underline text-left"
        >
          {row.invoiceNumber}
        </button>
      ),
    },
    {
      key: "invoiceKind",
      title: "Type",
      render: (row) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            row.invoiceKind === "onboarding"
              ? "bg-violet-50 text-violet-700"
              : "bg-sky-50 text-sky-700"
          }`}
        >
          {row.invoiceKind === "onboarding" ? "Onboarding" : "Subscription"}
        </span>
      ),
    },
    {
      key: "period",
      title: "Period",
      render: (row) =>
        row.invoiceKind === "onboarding" || row.billingCycle === "one_time"
          ? "One-time"
          : `${formatDate(row.periodStart)} – ${formatDate(row.periodEnd)}`,
    },
    {
      key: "billingCycle",
      title: "Cycle",
      render: (row) => CYCLE_LABELS[row.billingCycle] || row.billingCycle,
    },
    {
      key: "totalAmount",
      title: "Total",
      render: (row) => money(row.totalAmount),
    },
    {
      key: "amountPaid",
      title: "Paid",
      render: (row) => money(row.amountPaid),
    },
    {
      key: "balanceDue",
      title: "Due",
      render: (row) => money(row.balanceDue),
    },
    {
      key: "dueDate",
      title: "Due date",
      render: (row) => formatDate(row.dueDate),
    },
    {
      key: "status",
      title: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      title: "Actions",
      render: (row) => (
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            onClick={() => setViewInvoice(row)}
            className="text-slate-700 hover:underline text-sm"
          >
            View
          </button>
          {!["paid", "cancelled"].includes(row.status) && (
            <>
              <button
                type="button"
                onClick={() => setPayInvoice(row)}
                className="text-green-700 hover:underline text-sm"
              >
                Record payment
              </button>
              {(row.amountPaid || 0) === 0 && (
                <button
                  type="button"
                  onClick={() => handleCancelInvoice(row)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Cancel
                </button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  const usageColumns = [
    {
      key: "createdAt",
      title: "When",
      render: (row) => formatDateTime(row.createdAt),
    },
    {
      key: "userId",
      title: "Employee",
      render: (row) => row.userId?.name || row.userId?.email || "—",
    },
    {
      key: "usageType",
      title: "Type",
      render: (row) => row.usageType?.toUpperCase(),
    },
    { key: "minutesUsed", title: "Minutes" },
    { key: "source", title: "Source" },
  ];

  const memberColumns = [
    { key: "name", title: "Name" },
    { key: "email", title: "Email" },
    { key: "city", title: "City", render: (row) => row.city || "—" },
    {
      key: "createdAt",
      title: "Joined",
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: "isActive",
      title: "Status",
      render: (row) => (
        <span className={row.isActive !== false ? "text-green-700" : "text-slate-500"}>
          {row.isActive !== false ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "invoices", label: "Invoices & payments" },
    { id: "usage", label: "Usage log" },
    { id: "members", label: "Employees" },
  ];

  return (
    <div className="p-6">
      {payInvoice && (
        <PaymentModal
          invoice={payInvoice}
          onClose={() => setPayInvoice(null)}
          onSuccess={refresh}
        />
      )}
      {viewInvoice && (
        <InvoiceViewModal
          invoice={viewInvoice}
          corporate={corp}
          onClose={() => setViewInvoice(null)}
          onRecordPayment={(inv) => setPayInvoice(inv)}
        />
      )}
      {showGenerateModal && (
        <GenerateInvoiceModal
          corporateId={id}
          platformFee={billing?.monthlyPlatformFee || corp.monthlyPlatformFee}
          billingCycle={billing?.billingCycle || corp.billingCycle}
          existingInvoices={invoices}
          onClose={() => setShowGenerateModal(false)}
          onSuccess={refresh}
        />
      )}

      <button
        type="button"
        onClick={() => navigate("/corporate")}
        className="text-sm text-slate-500 hover:text-slate-800 mb-4"
      >
        ← Back to corporate accounts
      </button>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{corp.name}</h1>
          <p className="text-slate-500 text-sm mt-1">
            @{corp.emailDomain} · {corp.memberCount ?? 0} employees
            {corp.isActive ? (
              <span className="ml-2 text-green-700">Active</span>
            ) : (
              <span className="ml-2 text-slate-500">Inactive</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate(`/corporate/update/${id}`)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
          >
            Edit contract
          </button>
          <button
            type="button"
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm"
          >
            Generate invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Monthly platform fee"
          value={money(billing?.monthlyPlatformFee)}
          sub={CYCLE_LABELS[billing?.billingCycle] || billing?.billingCycle}
        />
        <StatCard
          label="Outstanding"
          value={money(billing?.totalOutstanding)}
          sub={
            billing?.overdueCount
              ? `${billing.overdueCount} overdue invoice(s)`
              : billing?.nextDueInvoice
                ? `Next due ${formatDate(billing.nextDueInvoice.dueDate)}`
                : "All clear"
          }
        />
        <StatCard label="Total collected" value={money(billing?.totalPaid)} />
        <StatCard
          label="Minute pools left"
          value={`A ${corp.audioMinutesRemaining} · V ${corp.videoMinutesRemaining} · C ${corp.chatMinutesRemaining}`}
          sub={`of ${corp.audioMinutesTotal} / ${corp.videoMinutesTotal} / ${corp.chatMinutesTotal}`}
        />
      </div>

      <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px ${
              tab === t.id
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Company owner & billing</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Owner login email</dt>
                <dd className="text-slate-900 text-right font-medium">
                  {corp.billingContactEmail || (
                    <span className="text-amber-600 font-normal">Not set — add in edit</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Owner name</dt>
                <dd className="text-slate-900 text-right">
                  {corp.billingContactName || "—"}
                </dd>
              </div>
              {corp.billingContactEmail && (
                <p className="text-xs text-slate-500 bg-violet-50 border border-violet-100 rounded-lg p-3 mt-2">
                  Owner signs in at{" "}
                  <strong>corporate.mejoric.com/corporate/login</strong> with this
                  email to view usage and employees.
                </p>
              )}
              <div className="flex justify-between">
                <dt className="text-slate-500">GST</dt>
                <dd>{corp.gstNumber || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Contract</dt>
                <dd>
                  {formatDate(corp.contractStartDate)}
                  {corp.contractEndDate ? ` – ${formatDate(corp.contractEndDate)}` : " (open)"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Days remaining</dt>
                <dd
                  className={
                    corp.contractExpired
                      ? "text-red-700 font-medium"
                      : corp.contractRemainingDays != null &&
                          corp.contractRemainingDays <= 30
                        ? "text-amber-700 font-medium"
                        : ""
                  }
                >
                  {corp.contractExpired
                    ? "Expired — login blocked"
                    : corp.contractRemainingDays == null
                      ? "Open-ended"
                      : `${corp.contractRemainingDays} day${corp.contractRemainingDays === 1 ? "" : "s"}`}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Payment terms</dt>
                <dd>{corp.paymentTermsDays ?? 15} days</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Setup fee</dt>
                <dd>{money(corp.setupFee)}</dd>
              </div>
            </dl>
            {corp.adminNotes && (
              <p className="mt-4 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                <span className="font-medium">Admin notes:</span> {corp.adminNotes}
              </p>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Usage summary (all time)</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              {["audio", "video", "chat"].map((type) => (
                <div key={type} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs uppercase text-slate-500">{type}</p>
                  <p className="text-lg font-bold">{usageStats?.[type]?.totalMinutes ?? 0}m</p>
                  <p className="text-xs text-slate-500">
                    {usageStats?.[type]?.sessions ?? 0} sessions
                  </p>
                </div>
              ))}
            </div>
            <h3 className="font-medium text-slate-800 mt-5 mb-2 text-sm">Recent usage</h3>
            <Table
              columns={usageColumns.slice(0, 4)}
              data={recentUsage}
              emptyMessage="No usage recorded yet."
            />
          </div>
        </div>
      )}

      {tab === "invoices" && (
        <div className="space-y-8">
          {billing?.nextDueInvoice && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
              <span className="font-medium">Next payment due:</span>{" "}
              {billing.nextDueInvoice.invoiceNumber} — {money(billing.nextDueInvoice.balanceDue)}{" "}
              by {formatDate(billing.nextDueInvoice.dueDate)}
              {billing.nextDueInvoice.invoiceKind === "onboarding" ? " (onboarding)" : ""}
            </div>
          )}

          <section>
            <div className="mb-3">
              <h2 className="text-base font-semibold text-slate-900">
                Onboarding charges
              </h2>
              <p className="text-sm text-slate-500">
                One-time setup / onboarding fees. Kept separate from recurring bills.
              </p>
            </div>
            <Table
              columns={invoiceColumns}
              data={onboardingInvoices}
              emptyMessage="No onboarding invoices."
            />
          </section>

          <section>
            <div className="mb-3">
              <h2 className="text-base font-semibold text-slate-900">
                Subscription billing history
              </h2>
              <p className="text-sm text-slate-500">
                Recurring platform fees by billing period.
              </p>
            </div>
            <Table
              columns={invoiceColumns}
              data={subscriptionInvoices}
              emptyMessage="No subscription invoices yet."
            />
          </section>
        </div>
      )}

      {tab === "usage" && (
        usageLoading ? (
          <Loader />
        ) : (
          <Table
            columns={usageColumns}
            data={usageData?.data?.data || []}
            emptyMessage="No usage logs yet."
          />
        )
      )}

      {tab === "members" && (
        membersLoading ? (
          <Loader />
        ) : (
          <Table
            columns={memberColumns}
            data={membersData?.data?.data || []}
            emptyMessage="No employees registered yet."
          />
        )
      )}
    </div>
  );
};

export default CorporateDetail;
