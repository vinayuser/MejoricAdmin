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

const CorporateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("overview");
  const [payInvoice, setPayInvoice] = useState(null);
  const [generating, setGenerating] = useState(false);

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
  const usageStats = dashboard?.usageStats;
  const recentUsage = dashboard?.recentUsage || [];

  const refresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["corporate-usage", id] });
    queryClient.invalidateQueries({ queryKey: ["corporates"] });
  };

  const handleGenerateInvoice = async () => {
    if (!window.confirm("Generate invoice for the current billing period?")) return;
    setGenerating(true);
    try {
      const url = API_ENDPOINTS.CORPORATE.GENERATE_INVOICE.replace(":id", id);
      await axiosInstance.post(url, {});
      toast.success("Invoice generated");
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to generate invoice");
    } finally {
      setGenerating(false);
    }
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
    { key: "invoiceNumber", title: "Invoice #" },
    {
      key: "period",
      title: "Period",
      render: (row) =>
        `${formatDate(row.periodStart)} – ${formatDate(row.periodEnd)}`,
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
      render: (row) =>
        !["paid", "cancelled"].includes(row.status) ? (
          <div className="flex gap-2">
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
          </div>
        ) : (
          "—"
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
            disabled={generating}
            onClick={handleGenerateInvoice}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate invoice"}
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
            <h2 className="font-semibold text-slate-900 mb-4">Contract & billing contact</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Billing contact</dt>
                <dd className="text-slate-900 text-right">
                  {corp.billingContactName || "—"}
                  {corp.billingContactEmail && (
                    <div className="text-slate-500">{corp.billingContactEmail}</div>
                  )}
                </dd>
              </div>
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
        <div>
          {billing?.nextDueInvoice && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
              <span className="font-medium">Next payment due:</span>{" "}
              {billing.nextDueInvoice.invoiceNumber} — {money(billing.nextDueInvoice.balanceDue)}{" "}
              by {formatDate(billing.nextDueInvoice.dueDate)}
            </div>
          )}
          <Table columns={invoiceColumns} data={invoices} emptyMessage="No invoices yet." />
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
