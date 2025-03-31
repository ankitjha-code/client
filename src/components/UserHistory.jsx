import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserHistory = ({ user }) => {
  const [subsidyRequests, setSubsidyRequests] = useState([]);
  const [kycHistory, setKycHistory] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("subsidy");

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      return;
    }

    fetchUserHistory();
  }, [user]);

  const fetchUserHistory = async () => {
    try {
      setLoading(true);

      // Fetch subsidy requests history
      const subsidyResponse = await axios.get(`/subsidies/user/${user._id}`);

      // Fetch KYC history
      const kycResponse = await axios.get(`/users/kyc-history/${user._id}`);

      if (subsidyResponse.data.success) {
        setSubsidyRequests(subsidyResponse.data.requests);
      }

      if (kycResponse.data.success) {
        setKycHistory(kycResponse.data.kycHistory);
      }
    } catch (err) {
      setError(
        "Failed to load history: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="history-container">
        <h2>Transaction History</h2>
        <p>Please sign in to view your history.</p>
        <button onClick={() => navigate("/")} className="action-btn">
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="history-container">
      <h2>My Transaction History</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-tabs">
        <button
          className={activeTab === "subsidy" ? "active" : ""}
          onClick={() => setActiveTab("subsidy")}
        >
          Subsidy Requests
        </button>
        <button
          className={activeTab === "kyc" ? "active" : ""}
          onClick={() => setActiveTab("kyc")}
        >
          KYC History
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {activeTab === "subsidy" && (
            <div className="history-section">
              <h3>Subsidy Request History</h3>

              {subsidyRequests.length === 0 ? (
                <p>No subsidy requests found</p>
              ) : (
                <div className="history-table-wrapper">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Requested</th>
                        <th>Processed</th>
                        <th>Reason</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subsidyRequests.map((request) => (
                        <tr key={request._id}>
                          <td>{request.amount}</td>
                          <td>
                            <span className={`status-${request.status}`}>
                              {request.status.charAt(0).toUpperCase() +
                                request.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            {new Date(request.requestedAt).toLocaleDateString()}
                          </td>
                          <td>
                            {request.processedAt
                              ? new Date(
                                  request.processedAt
                                ).toLocaleDateString()
                              : "Pending"}
                          </td>
                          <td>{request.reason}</td>
                          <td>
                            {request.status === "rejected" && (
                              <div className="rejection-details">
                                <strong>Rejection Reason:</strong>
                                <p>
                                  {request.rejectionReason ||
                                    "No reason provided"}
                                </p>
                                {request.isResubmission && (
                                  <p>
                                    <strong>Resubmission Note:</strong>{" "}
                                    {request.resubmissionNote}
                                  </p>
                                )}
                              </div>
                            )}
                            {request.status === "approved" &&
                              request.transactionHash && (
                                <a
                                  href={`https://explorer.solana.com/tx/${request.transactionHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="action-btn"
                                >
                                  View Transaction
                                </a>
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

          {activeTab === "kyc" && (
            <div className="history-section">
              <h3>KYC Verification History</h3>

              {!kycHistory.submissions ||
              kycHistory.submissions.length === 0 ? (
                <p>No KYC history found</p>
              ) : (
                <div className="history-table-wrapper">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Submission Date</th>
                        <th>Status</th>
                        <th>Verified Date</th>
                        <th>Document</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kycHistory.submissions.map((submission, index) => (
                        <tr key={index}>
                          <td>
                            {new Date(
                              submission.submittedAt
                            ).toLocaleDateString()}
                          </td>
                          <td>
                            <span className={`status-${submission.status}`}>
                              {submission.status.charAt(0).toUpperCase() +
                                submission.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            {submission.verifiedAt
                              ? new Date(
                                  submission.verifiedAt
                                ).toLocaleDateString()
                              : submission.rejectedAt
                              ? new Date(
                                  submission.rejectedAt
                                ).toLocaleDateString()
                              : "Pending"}
                          </td>
                          <td>
                            <a
                              href={submission.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="action-btn"
                            >
                              View Document
                            </a>
                          </td>
                          <td>
                            {submission.status === "rejected" && (
                              <div className="rejection-details">
                                <strong>Rejection Reason:</strong>
                                <p>
                                  {submission.rejectionReason ||
                                    "No reason provided"}
                                </p>
                                {submission.resubmissionNote && (
                                  <p>
                                    <strong>Resubmission Note:</strong>{" "}
                                    {submission.resubmissionNote}
                                  </p>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="kyc-current-status">
                <h4>Current KYC Status</h4>
                <p>
                  <strong>Status:</strong>{" "}
                  {user.kycVerified ? (
                    <span className="status-approved">Verified</span>
                  ) : user.kycDocumentUrl ? (
                    <span className="status-pending">Pending</span>
                  ) : (
                    <span className="status-incomplete">Not Submitted</span>
                  )}
                </p>
                {user.kycVerifiedAt && (
                  <p>
                    <strong>Verified on:</strong>{" "}
                    {new Date(user.kycVerifiedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserHistory;
