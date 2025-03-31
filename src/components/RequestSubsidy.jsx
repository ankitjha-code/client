import React, { useState, useEffect } from "react";
import axios from "axios";

const RequestSubsidy = ({ user }) => {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [resubmissionNote, setResubmissionNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("new");

  // Fetch user's rejected requests
  useEffect(() => {
    if (user && user._id) {
      fetchRejectedRequests();
    }
  }, [user]);

  const fetchRejectedRequests = async () => {
    try {
      const response = await axios.get(`/subsidies/user/${user._id}`);
      if (response.data.success) {
        // Filter for rejected requests
        const rejected = response.data.requests.filter(
          (req) => req.status === "rejected"
        );
        setRejectedRequests(rejected);
      }
    } catch (err) {
      console.error("Error fetching rejected requests:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.kycVerified) {
      setError("Your KYC must be verified before requesting subsidy");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post("/subsidies/request", {
        userId: user._id,
        amount: parseFloat(amount),
        reason,
      });

      if (response.data.success) {
        setSuccess("Subsidy request submitted successfully!");
        setAmount("");
        setReason("");
        fetchRejectedRequests(); // Refresh rejected requests
      }
    } catch (err) {
      setError(err.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResubmit = async (requestId) => {
    if (!resubmissionNote) {
      setError("Please explain how you've addressed the rejection reason");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(`/subsidies/resubmit/${requestId}`, {
        userId: user._id,
        resubmissionNote,
      });

      if (response.data.success) {
        setSuccess("Subsidy request resubmitted successfully!");
        setResubmissionNote("");
        fetchRejectedRequests(); // Refresh rejected requests
        setActiveTab("new"); // Switch back to new request tab
      }
    } catch (err) {
      setError(err.response?.data?.message || "Resubmission failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="subsidy-container">
        <h2>Request Subsidy</h2>
        <p>Please sign in to request subsidies.</p>
      </div>
    );
  }

  if (!user.kycVerified) {
    return (
      <div className="subsidy-container">
        <h2>Request Subsidy</h2>
        <div className="warning-message">
          Your KYC documents have not been verified yet. Please wait for admin
          verification before requesting subsidies.
        </div>
      </div>
    );
  }

  return (
    <div className="subsidy-container">
      <h2>Subsidy Requests</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="admin-tabs subsidy-tabs">
        <button
          className={activeTab === "new" ? "active" : ""}
          onClick={() => setActiveTab("new")}
        >
          New Request
        </button>
        <button
          className={activeTab === "rejected" ? "active" : ""}
          onClick={() => setActiveTab("rejected")}
        >
          Rejected Requests ({rejectedRequests.length})
        </button>
      </div>

      {activeTab === "new" && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="amount">Amount (SOL)</label>
            <input
              type="number"
              id="amount"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="Enter subsidy amount"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason for Subsidy</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={4}
              placeholder="Explain why you need this subsidy"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      )}

      {activeTab === "rejected" && (
        <div className="rejected-requests">
          {rejectedRequests.length === 0 ? (
            <p>No rejected subsidy requests</p>
          ) : (
            <>
              <h3>Select a request to resubmit</h3>
              {rejectedRequests.map((request) => (
                <div
                  key={request._id}
                  className="info-box rejected-request-card"
                >
                  <div className="request-details">
                    <p>
                      <strong>Amount:</strong> {request.amount} SOL
                    </p>
                    <p>
                      <strong>Requested:</strong>{" "}
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Original Reason:</strong> {request.reason}
                    </p>
                    <p className="rejection-reason">
                      <strong>Rejection Reason:</strong>{" "}
                      {request.rejectionReason || "No reason provided"}
                    </p>
                  </div>
                  <div className="resubmit-form form-group">
                    <label htmlFor={`resubmit-${request._id}`}>
                      Resubmission Note
                    </label>
                    <textarea
                      id={`resubmit-${request._id}`}
                      placeholder="Explain how you've addressed the rejection reason..."
                      value={resubmissionNote}
                      onChange={(e) => setResubmissionNote(e.target.value)}
                      required
                      rows={3}
                    />
                    <button
                      onClick={() => handleResubmit(request._id)}
                      className="action-btn"
                      disabled={loading}
                    >
                      {loading ? "Resubmitting..." : "Resubmit Request"}
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RequestSubsidy;
