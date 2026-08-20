import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  usePostMutation,
  useGetQuery,
  usePutMutation,
} from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import { toast } from "react-hot-toast";
import Loader from "../../components/UI/Loader";

const emptyForm = {
  name: "",
  emailDomain: "",
  audioMinutesTotal: "",
  videoMinutesTotal: "",
  chatMinutesTotal: "",
  isActive: true,
  billingContactName: "",
  billingContactEmail: "",
  billingContactPhone: "",
  gstNumber: "",
  billingAddress: "",
  monthlyPlatformFee: "",
  billingCycle: "monthly",
  contractStartDate: "",
  contractEndDate: "",
  paymentTermsDays: "15",
  setupFee: "",
  adminNotes: "",
  autoRenewInvoice: true,
  generateInitialInvoice: true,
};

const toDateInput = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

const CorporateAddEdit = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);

  const { data, isPending: isFetching } = useGetQuery(
    isEdit
      ? API_ENDPOINTS.CORPORATE.GET_ONE.replace(":id", id)
      : "/corporate/admin/getAll?limit=1",
    ["corporate-account", id],
    { enabled: isEdit },
  );

  const { mutate: createCorporate, isPending: isCreating } = usePostMutation(
    API_ENDPOINTS.CORPORATE.CREATE,
  );
  const { mutate: updateCorporate, isPending: isUpdating } = usePutMutation(
    API_ENDPOINTS.CORPORATE.UPDATE.replace(":id", id || ""),
  );

  useEffect(() => {
    const corp = data?.data;
    if (!corp || !isEdit) return;
    setForm({
      name: corp.name || "",
      emailDomain: corp.emailDomain || "",
      audioMinutesTotal: String(corp.audioMinutesTotal ?? 0),
      videoMinutesTotal: String(corp.videoMinutesTotal ?? 0),
      chatMinutesTotal: String(corp.chatMinutesTotal ?? 0),
      isActive: corp.isActive !== false,
      billingContactName: corp.billingContactName || "",
      billingContactEmail: corp.billingContactEmail || "",
      billingContactPhone: corp.billingContactPhone || "",
      gstNumber: corp.gstNumber || "",
      billingAddress: corp.billingAddress || "",
      monthlyPlatformFee: String(corp.monthlyPlatformFee ?? 0),
      billingCycle: corp.billingCycle || "monthly",
      contractStartDate: toDateInput(corp.contractStartDate),
      contractEndDate: toDateInput(corp.contractEndDate),
      paymentTermsDays: String(corp.paymentTermsDays ?? 15),
      setupFee: String(corp.setupFee ?? 0),
      adminNotes: corp.adminNotes || "",
      autoRenewInvoice: corp.autoRenewInvoice !== false,
      generateInitialInvoice: false,
    });
  }, [data, isEdit]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    emailDomain: form.emailDomain.trim().replace(/^@+/, ""),
    audioMinutesTotal: parseInt(form.audioMinutesTotal, 10) || 0,
    videoMinutesTotal: parseInt(form.videoMinutesTotal, 10) || 0,
    chatMinutesTotal: parseInt(form.chatMinutesTotal, 10) || 0,
    isActive: form.isActive,
    billingContactName: form.billingContactName.trim(),
    billingContactEmail: form.billingContactEmail.trim(),
    billingContactPhone: form.billingContactPhone.trim(),
    gstNumber: form.gstNumber.trim(),
    billingAddress: form.billingAddress.trim(),
    monthlyPlatformFee: parseFloat(form.monthlyPlatformFee) || 0,
    billingCycle: form.billingCycle,
    contractStartDate: form.contractStartDate || undefined,
    contractEndDate: form.contractEndDate || undefined,
    paymentTermsDays: parseInt(form.paymentTermsDays, 10) || 15,
    setupFee: parseFloat(form.setupFee) || 0,
    adminNotes: form.adminNotes.trim(),
    autoRenewInvoice: form.autoRenewInvoice,
    generateInitialInvoice: form.generateInitialInvoice,
  });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Company name is required");
      return;
    }
    if (!form.emailDomain.trim()) {
      toast.error("Email domain is required");
      return;
    }

    const payload = buildPayload();
    const opts = {
      onSuccess: (res) => {
        toast.success(isEdit ? "Corporate account updated" : "Corporate account created");
        const corpId = isEdit ? id : res?.data?._id;
        navigate(corpId ? `/corporate/view/${corpId}` : "/corporate");
      },
      onError: (err) =>
        toast.error(err?.response?.data?.message || "Failed to save"),
    };

    if (isEdit) updateCorporate(payload, opts);
    else createCorporate(payload, opts);
  };

  if (isEdit && isFetching) return <Loader />;

  return (
    <div className="p-6 max-w-3xl">
      <button
        type="button"
        onClick={() => navigate(isEdit ? `/corporate/view/${id}` : "/corporate")}
        className="text-sm text-slate-500 hover:text-slate-800 mb-4"
      >
        ← Back
      </button>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        {isEdit ? "Edit corporate contract" : "Add corporate account"}
      </h1>
      <p className="text-slate-500 text-sm mb-6">
        Set company access, minute pools, and commercial terms (what the company pays Mejoric each cycle).
      </p>

      <form onSubmit={onSubmit} className="space-y-8">
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-slate-900">Company & access</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company name</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Outline India"
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Allowed email domain</label>
            <input
              name="emailDomain"
              value={form.emailDomain}
              onChange={onChange}
              placeholder="outlinesystem.com"
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              ["audioMinutesTotal", "Audio minutes"],
              ["videoMinutesTotal", "Video minutes"],
              ["chatMinutesTotal", "Chat minutes"],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <input
                  name={name}
                  type="number"
                  min="0"
                  value={form[name]}
                  onChange={onChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={onChange} />
            Active (visible on corporate login page)
          </label>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-slate-900">Commercial terms (B2B billing)</h2>
          <p className="text-xs text-slate-500 -mt-2">
            Employees use the platform for free from the minute pool. The company is invoiced separately for platform fees.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Platform fee per cycle (₹)
              </label>
              <input
                name="monthlyPlatformFee"
                type="number"
                min="0"
                step="0.01"
                value={form.monthlyPlatformFee}
                onChange={onChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Billing cycle</label>
              <select
                name="billingCycle"
                value={form.billingCycle}
                onChange={onChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="half_yearly">Half-yearly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Setup / onboarding fee (₹)</label>
              <input
                name="setupFee"
                type="number"
                min="0"
                step="0.01"
                value={form.setupFee}
                onChange={onChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment terms (days)</label>
              <input
                name="paymentTermsDays"
                type="number"
                min="0"
                value={form.paymentTermsDays}
                onChange={onChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contract start</label>
              <input
                name="contractStartDate"
                type="date"
                value={form.contractStartDate}
                onChange={onChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contract end (optional)</label>
              <input
                name="contractEndDate"
                type="date"
                value={form.contractEndDate}
                onChange={onChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="autoRenewInvoice"
              checked={form.autoRenewInvoice}
              onChange={onChange}
            />
            Auto-generate invoices for new billing periods
          </label>
          {!isEdit && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="generateInitialInvoice"
                checked={form.generateInitialInvoice}
                onChange={onChange}
              />
              Create setup fee & first period invoice on save
            </label>
          )}
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-slate-900">Billing contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact name</label>
              <input
                name="billingContactName"
                value={form.billingContactName}
                onChange={onChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact email</label>
              <input
                name="billingContactEmail"
                type="email"
                value={form.billingContactEmail}
                onChange={onChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input
                name="billingContactPhone"
                value={form.billingContactPhone}
                onChange={onChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">GST number</label>
              <input
                name="gstNumber"
                value={form.gstNumber}
                onChange={onChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Billing address</label>
            <textarea
              name="billingAddress"
              value={form.billingAddress}
              onChange={onChange}
              rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Internal admin notes</label>
            <textarea
              name="adminNotes"
              value={form.adminNotes}
              onChange={onChange}
              rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              placeholder="PO number, special terms, renewal reminders..."
            />
          </div>
        </section>

        <button
          type="submit"
          disabled={isCreating || isUpdating}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-medium disabled:opacity-50"
        >
          {isCreating || isUpdating ? "Saving..." : isEdit ? "Update contract" : "Create corporate account"}
        </button>
      </form>
    </div>
  );
};

export default CorporateAddEdit;
