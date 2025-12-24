import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";

export default function AdminDashboard() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showAllPending, setShowAllPending] = useState(false);

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [claimToApprove, setClaimToApprove] = useState(null);
  const [approvedAmount, setApprovedAmount] = useState("");

  // New: search term state
  const [searchTerm, setSearchTerm] = useState("");

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/claim/all");
      console.debug("Fetched claims:", res.data?.data);
      if (res.data?.data) {
        setClaims(res.data.data);
      } else {
        setClaims([]);
      }
    } catch (err) {
      console.error("Fetch claims error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch claims";
      toast.error(errorMessage);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const openDetails = async (claim) => {
    try {
      setSelectedClaim(claim);
      setIsModalOpen(true);

      const sensorRef = claim.sensorDataId;
      const needsFetch =
        sensorRef &&
        (sensorRef.soilMoisture === undefined || sensorRef.soilMoisture === null);

      if (sensorRef && needsFetch) {
        setDetailsLoading(true);
        const sensorId = typeof sensorRef === "string" ? sensorRef : sensorRef._id;
        const res = await api.get(`/sensor/${sensorId}`);
        const sensor = res.data?.data;
        setSelectedClaim((prev) => ({ ...prev, sensorDataId: sensor }));
      }
    } catch (err) {
      console.error("Failed to load sensor details:", err);
      toast.error(err.response?.data?.message || "Failed to load sensor");
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const openApprovalModal = (claim) => {
    setClaimToApprove(claim);
    setApprovedAmount(claim.approvedAmount || claim.expectedAmount || "");
    setIsApprovalModalOpen(true);
  };

  const handleApproveWithAmount = async () => {
    if (!claimToApprove) return;

    const amount = Number(approvedAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid approved amount");
      return;
    }

    try {
      setActionLoading(true);
      await api.patch(`/claim/${claimToApprove._id}`, {
        status: "approved",
        approvedAmount: amount,
      });
      toast.success(`Claim approved with ₹${amount.toLocaleString()}`);
      setIsApprovalModalOpen(false);
      setClaimToApprove(null);
      setApprovedAmount("");
      fetchClaims();
    } catch (err) {
      console.error("Approval error:", err);
      toast.error(err.response?.data?.message || "Approval failed");
    } finally {
      setActionLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setActionLoading(true);
      const payload = { status };

      await api.patch(`/claim/${id}`, payload);
      toast.success(`Claim ${status} successfully`);
      fetchClaims();
    } catch (err) {
      console.error("Update status error:", err);
      console.error("Error details:", err.response?.data);
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader />;

  // Stats (always based on all claims)
  const pendingCount = claims.filter((c) => c.status === "pending").length;
  const approvedCount = claims.filter((c) => c.status === "approved").length;
  const rejectedCount = claims.filter((c) => c.status === "rejected").length;

  // New: filtered claims based on search term
  const normalizedSearch = searchTerm.toLowerCase().trim();
  const filteredClaims = !normalizedSearch
    ? claims
    : claims.filter((c) => {
        const fields = [
          c.farmerId?.name,
          c.farmerId?.email,
          c.cropType,
          c.reason,
          c.status,
        ];
        return fields.some((field) =>
          field
            ? String(field).toLowerCase().includes(normalizedSearch)
            : false
        );
      });

  // Pending list for current filter
  const filteredPendingList = filteredClaims.filter(
    (c) => c.status === "pending"
  );
  const pendingVisibleCount = filteredPendingList.length;

  const getStatusBadge = (status) => {
    const styles = {
      approved: "bg-green-50 text-green-700 border border-green-200",
      rejected: "bg-red-50 text-red-700 border border-red-200",
      pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          styles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  const getHandledBy = (claim) => {
    if (!claim) return "—";
    if (claim.approvedBy && claim.approvedBy.name) {
      return claim.approvedBy.name;
    }
    const autoEntry = claim.history?.find(
      (h) => h.action === "auto_approved" || h.action === "auto_rejected"
    );
    if (autoEntry) {
      return autoEntry.action === "auto_approved"
        ? "System (auto-approved)"
        : "System (auto-rejected)";
    }
    if (claim.autoStatus === "approved") return "System (auto-approved)";
    if (claim.autoStatus === "rejected") return "System (auto-rejected)";
    return "—";
  };

  // New: CSV export handler (exports current filteredClaims)
  const handleExportCSV = () => {
    const dataToExport = filteredClaims;

    if (!dataToExport || dataToExport.length === 0) {
      toast.error("No claims to export");
      return;
    }

    try {
      const headers = [
        "Claim ID",
        "Farmer Name",
        "Farmer Email",
        "Crop Type",
        "Reason",
        "Requested Amount",
        "Approved Amount",
        "Status",
        "Handled By",
        "Confidence Score",
        "Decision Source",
        "Soil Moisture",
        "Air Temperature",
        "Humidity",
        "Soil Temperature",
        "Damage Image URL",
        "Created At",
      ];

      const rows = dataToExport.map((claim) => [
        claim._id || "",
        claim.farmerId?.name || "",
        claim.farmerId?.email || "",
        claim.cropType || "",
        claim.reason || "",
        claim.expectedAmount != null ? Number(claim.expectedAmount) : "",
        claim.approvedAmount != null ? Number(claim.approvedAmount) : "",
        claim.status || "",
        getHandledBy(claim),
        claim.confidenceScore !== null && claim.confidenceScore !== undefined
          ? `${(claim.confidenceScore * 100).toFixed(0)}%`
          : "",
        claim.decisionSource || "",
        claim.sensorDataId?.soilMoisture ?? "",
        claim.sensorDataId?.airTemp ?? "",
        claim.sensorDataId?.humidity ?? "",
        claim.sensorDataId?.soilTemp ?? "",
        claim.damageImage || "",
        claim.createdAt ? new Date(claim.createdAt).toISOString() : "",
      ]);

      const csvContent = [headers, ...rows]
        .map((row) =>
          row
            .map((value) => {
              const stringValue =
                value === null || value === undefined ? "" : String(value);
              const escaped = stringValue.replace(/"/g, '""');
              return `"${escaped}"`;
            })
            .join(",")
        )
        .join("\n");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-");
      link.href = url;
      link.setAttribute("download", `claims-${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("CSV exported");
    } catch (err) {
      console.error("CSV export error:", err);
      toast.error("Failed to export CSV");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm rounded-xl -mx-6 -mt-6 px-6 py-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Manage and review insurance claims with real-time insights
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg
                className="w-4 h-4 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>Live updates</span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            { label: "Total Claims", value: claims.length, color: "blue", icon: "clipboard" },
            { label: "Pending Review", value: pendingCount, color: "amber", icon: "alert" },
            { label: "Approved", value: approvedCount, color: "green", icon: "check" },
            { label: "Rejected", value: rejectedCount, color: "red", icon: "x" },
          ].map(({ label, value, color, icon }) => (
            <div
              key={label}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}>
                  {icon === "clipboard" && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  )}
                  {icon === "alert" && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  )}
                  {icon === "check" && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {icon === "x" && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-500">{label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Pending Requests Section */}
        {pendingCount > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Pending Claims</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {pendingVisibleCount} claims awaiting approval
                  </p>
                </div>
                <button
                  onClick={() => setShowAllPending(!showAllPending)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                >
                  {showAllPending ? "Show Less" : `View All ${pendingVisibleCount}`}
                  <svg
                    className={`w-4 h-4 transform transition-transform ${
                      showAllPending ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {(showAllPending ? filteredPendingList : filteredPendingList.slice(0, 5)).map(
                (claim) => (
                  <div
                    key={claim._id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 hover:bg-gray-50 transition-colors border-t border-gray-100 first:border-t-0"
                  >
                    <div className="flex items-center gap-4 flex-1 mb-3 sm:mb-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center font-semibold text-lg text-gray-700 shadow-sm">
                        {claim.farmerId?.name?.[0]?.toUpperCase() || "F"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm leading-tight">
                          {claim.farmerId?.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                          <span className="bg-gray-100 px-2 py-0.5 rounded">
                            {claim.cropType}
                          </span>
                          <span>{new Date(claim.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-2 line-clamp-2">
                          {claim.reason}
                        </div>
                        <div className="text-xs text-gray-700 mt-1">
                          Requested:{" "}
                          <strong className="text-gray-900">
                            {claim.expectedAmount
                              ? `₹${Number(claim.expectedAmount).toLocaleString()}`
                              : "—"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        onClick={() => openDetails(claim)}
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openApprovalModal(claim)}
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(claim._id, "rejected")}
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>

            {pendingVisibleCount > 5 && (
              <div className="px-6 py-4 text-center border-t border-gray-200">
                <button
                  onClick={() => setShowAllPending(!showAllPending)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
                >
                  {showAllPending
                    ? "Show Less"
                    : `View All ${pendingVisibleCount} Pending Claims`}
                  <svg
                    className={`w-4 h-4 transform transition-transform ${
                      showAllPending ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Claims Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* New: header with search + export */}
          <div className="px-6 py-5 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">All Claims</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by farmer, crop, status..."
                  className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <svg
                  className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
                  />
                </svg>
              </div>
              <button
                onClick={handleExportCSV}
                disabled={filteredClaims.length === 0}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                  />
                </svg>
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {claims.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-500 font-medium">No claims found</p>
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15zM21 21l-4.35-4.35"
                />
              </svg>
              <p className="text-gray-500 font-medium">
                No claims match your search
              </p>
              {searchTerm && (
                <p className="text-gray-400 text-sm mt-1">
                  Try adjusting or clearing your search.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">
                      Farmer
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">
                      Crop
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">
                      Requested
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">
                      Handled By
                    </th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-600 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredClaims.map((claim) => (
                    <tr
                      key={claim._id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center font-semibold text-gray-700 shadow-sm">
                            {claim.farmerId?.name?.[0]?.toUpperCase() || "F"}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {claim.farmerId?.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {claim.farmerId?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {claim.cropType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                        <div className="line-clamp-2" title={claim.reason}>
                          {claim.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {claim.expectedAmount
                            ? `₹${Number(claim.expectedAmount).toLocaleString()}`
                            : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(claim.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {getHandledBy(claim)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openDetails(claim)}
                          className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                        >
                          View
                        </button>
                        {claim.status === "pending" && (
                          <>
                            <button
                              disabled={actionLoading}
                              onClick={() => openApprovalModal(claim)}
                              className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => updateStatus(claim._id, "rejected")}
                              className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {claim.status !== "pending" && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Approval Modal */}
        {isApprovalModalOpen && claimToApprove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setIsApprovalModalOpen(false)}
            ></div>
            <div className="relative bg-white rounded-2xl z-50 max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100">
              <div className="border-b border-gray-200 px-6 py-5">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Approve Claim
                  </h3>
                  <button
                    onClick={() => {
                      setIsApprovalModalOpen(false);
                      setClaimToApprove(null);
                      setApprovedAmount("");
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Farmer:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {claimToApprove.farmerId?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Crop Type:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {claimToApprove.cropType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Requested Amount:
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{Number(claimToApprove.expectedAmount).toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-600">Reason:</span>
                    <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                      {claimToApprove.reason}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Approved Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter approved amount"
                    min="0"
                    step="1"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Enter the final approved amount for this claim
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setIsApprovalModalOpen(false);
                      setClaimToApprove(null);
                      setApprovedAmount("");
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium text-gray-700 transition-colors"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApproveWithAmount}
                    disabled={actionLoading || !approvedAmount}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {actionLoading ? "Processing..." : "Approve Claim"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Claim Details Modal */}
        {isModalOpen && selectedClaim && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setIsModalOpen(false)}
            ></div>
            <div className="relative bg-white rounded-2xl z-50 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 scale-100">
              <div className="border-b border-gray-200 px-6 py-5 sticky top-0 bg-white z-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Claim Details
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Processed By</p>
                    <p className="font-semibold text-gray-900">
                      {getHandledBy(selectedClaim)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">
                      Requested Amount
                    </p>
                    <p className="font-semibold text-gray-900">
                      {selectedClaim.expectedAmount
                        ? `₹${Number(selectedClaim.expectedAmount).toLocaleString()}`
                        : "—"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">
                      Approved Amount
                    </p>
                    <p className="font-semibold text-gray-900">
                      {selectedClaim.approvedAmount
                        ? `₹${Number(selectedClaim.approvedAmount).toLocaleString()}`
                        : "—"}
                    </p>
                  </div>
                  {selectedClaim.confidenceScore !== null &&
                    selectedClaim.confidenceScore !== undefined && (
                      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">
                          Confidence Score
                        </p>
                        <p className="font-semibold text-gray-900">
                          {(selectedClaim.confidenceScore * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          System confidence level
                        </p>
                      </div>
                    )}
                </div>

                {selectedClaim.decisionSource && (
                  <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">
                          Decision Source
                        </p>
                        <p className="font-semibold text-gray-900">
                          {selectedClaim.decisionSource}
                        </p>
                        {selectedClaim.confidenceScore !== null &&
                          selectedClaim.confidenceScore !== undefined && (
                            <p className="text-xs text-gray-500 mt-1">
                              Confidence:{" "}
                              {(selectedClaim.confidenceScore * 100).toFixed(0)}%
                            </p>
                          )}
                      </div>
                      {selectedClaim.mlUsed !== undefined && (
                        <span className="text-xs text-gray-600">
                          ML: {selectedClaim.mlUsed ? "Used" : "Not Used"}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sensor Readings */}
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Sensor Readings
                    </p>
                    {detailsLoading ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    ) : selectedClaim.sensorDataId &&
                      selectedClaim.sensorDataId.soilMoisture !== undefined ? (
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded border border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Soil Moisture
                            </span>
                            <span className="font-semibold text-gray-900">
                              {selectedClaim.sensorDataId.soilMoisture}%
                            </span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Air Temperature
                            </span>
                            <span className="font-semibold text-gray-900">
                              {selectedClaim.sensorDataId.airTemp}°C
                            </span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Humidity
                            </span>
                            <span className="font-semibold text-gray-900">
                              {selectedClaim.sensorDataId.humidity}%
                            </span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Soil Temperature
                            </span>
                            <span className="font-semibold text-gray-900">
                              {selectedClaim.sensorDataId.soilTemp}°C
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-3">
                          Recorded:{" "}
                          {new Date(
                            selectedClaim.sensorDataId.createdAt
                          ).toLocaleString()}
                        </div>
                      </div>
                    ) : selectedClaim.sensorDataId ? (
                      <div className="h-64 flex flex-col items-center justify-center">
                        <p className="text-gray-500 mb-3">
                          Sensor data not loaded
                        </p>
                        <button
                          onClick={() => openDetails(selectedClaim)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                          Load Sensor Data
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                        <svg
                          className="w-12 h-12 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                          />
                        </svg>
                        <p className="text-gray-500 mt-2">
                          No sensor data linked
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Damage Image */}
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Damage Image
                    </p>
                    {selectedClaim.damageImage ? (
                      <a
                        href={selectedClaim.damageImage}
                        target="_blank"
                        rel="noreferrer"
                        className="block"
                      >
                        <img
                          src={selectedClaim.damageImage}
                          alt="Damage"
                          className="w-full h-64 object-cover rounded border border-gray-300 hover:border-gray-400 transition-colors cursor-pointer"
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Click to view full size
                        </p>
                      </a>
                    ) : (
                      <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                        <p className="text-gray-400">No image available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}