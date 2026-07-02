import { useState } from "react";
import { MessageSquare, Send, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
import API_ENDPOINTS from "../api/apiEndpoint";

const ROLE_OPTIONS = [
  { value: "user", label: "All Users" },
  { value: "mate", label: "All Mates" },
  { value: "mentor", label: "All Mentors" },
  { value: "staff", label: "All Staff" },
];

const BulkSms = () => {
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("user");
  const [manualMobiles, setManualMobiles] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      toast.error("Enter a message");
      return;
    }

    const mobiles = manualMobiles
      .split(/[\n,;]+/)
      .map((m) => m.trim())
      .filter(Boolean);

    const payload = { message: trimmed };
    if (mobiles.length > 0) {
      payload.mobiles = mobiles;
    } else {
      payload.role = role;
    }

    setIsSending(true);
    setResult(null);
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.SMS.BULK, payload);
      const data = response.data?.data;
      setResult(data);
      toast.success(
        `SMS sent: ${data?.sent || 0} success, ${data?.failed || 0} failed`,
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to send bulk SMS",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-gradient-to-r from-purple-600 to-violet-500 p-3">
          <MessageSquare className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bulk SMS</h1>
          <p className="text-sm text-slate-500">
            Send SMS via 2factor to users by role or specific numbers
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSend}
        className="space-y-6 rounded-xl border border-slate-100 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={1000}
            placeholder="Type your SMS message..."
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
          />
          <p className="mt-1 text-xs text-slate-400">
            {message.length}/1000 characters. DLT-approved templates may be
            required on your 2factor account.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Recipients by role
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={manualMobiles.trim().length > 0}
              className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-50"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Sends to all users with a mobile number for the selected role.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Or specific mobile numbers (optional)
          </label>
          <textarea
            value={manualMobiles}
            onChange={(e) => setManualMobiles(e.target.value)}
            rows={3}
            placeholder="9876543210, 9123456789 (one per line or comma-separated)"
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
          />
          <p className="mt-1 text-xs text-slate-400">
            If numbers are entered here, role filter is ignored.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSending}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-500 px-6 py-3 text-sm font-semibold text-white hover:from-purple-700 hover:to-violet-600 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {isSending ? "Sending..." : "Send Bulk SMS"}
        </button>
      </form>

      {result && (
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Results</h2>
          <p className="mb-4 text-sm text-slate-600">
            Sent: <strong>{result.sent}</strong> · Failed:{" "}
            <strong>{result.failed}</strong> · Total:{" "}
            <strong>{result.total}</strong>
          </p>
          {result.results?.length > 0 && (
            <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2">Mobile</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((row) => (
                    <tr key={row.mobile} className="border-t border-slate-50">
                      <td className="px-4 py-2">{row.mobile}</td>
                      <td className="px-4 py-2">
                        {row.success ? (
                          <span className="text-emerald-600">Sent</span>
                        ) : (
                          <span className="text-red-600" title={row.error}>
                            Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkSms;
