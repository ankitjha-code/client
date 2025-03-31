import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminPanel = () => {
  const adminPublicKey = "AH9WTkjGcnUUzrc9L4Ar5BxhxVq96NXXHp2ZkesS61pi";
  const [users, setUsers] = useState([]);
  const [subsidyRequests, setSubsidyRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [isAdmin, setIsAdmin] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentWallet, setCurrentWallet] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingRequestId, setRejectingRequestId] = useState(null);
  const [kycRejectionReason, setKycRejectionReason] = useState("");
  const [rejectingKycUserId, setRejectingKycUserId] = useState(null);

  useEffect(() => {
    // Check if wallet is connected and if it's admin
    const checkAdmin = async () => {
      try {
        // First try to reconnect if the wallet exists but isn't connected
        if (window.solana && !window.solana.isConnected) {
          try {
            // Attempt to reconnect to the wallet
            await window.solana.connect({ onlyIfTrusted: true });
            console.log("Reconnected to wallet after page refresh");
          } catch (reconnectErr) {
            console.log("Automatic reconnection failed:", reconnectErr.message);
            // Continue with the rest of the function, the user may need to manually reconnect
          }
        }

        // Now check if connected
        if (window.solana && window.solana.isConnected) {
          const publicKey = window.solana.publicKey.toString();
          console.log("Connected wallet:", publicKey);
          console.log("Admin wallet:", adminPublicKey);
          console.log("Is admin?", publicKey === adminPublicKey);

          setWalletConnected(true);
          setCurrentWallet(publicKey);
          setIsAdmin(publicKey === adminPublicKey);

          // Store admin status in sessionStorage to persist across page refreshes
          sessionStorage.setItem("isAdmin", publicKey === adminPublicKey);
        } else {
          console.log("Wallet not connected");
          setWalletConnected(false);
          setIsAdmin(false);
          sessionStorage.removeItem("isAdmin");
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
        setError("Error verifying admin status: " + err.message);
      }
    };

    // Try to restore from session if it exists
    const storedAdminStatus = sessionStorage.getItem("isAdmin") === "true";
    if (storedAdminStatus) {
      console.log("Restoring admin status from session storage");
      setIsAdmin(true);
    }

    checkAdmin();

    // Check wallet status when it changes
    const onWalletChange = () => {
      checkAdmin();
    };

    window.addEventListener("solana#accountChanged", onWalletChange);

    // Also listen for wallet connection events
    window.addEventListener("solana#connected", onWalletChange);
    window.addEventListener("solana#disconnected", onWalletChange);

    return () => {
      window.removeEventListener("solana#accountChanged", onWalletChange);
      window.removeEventListener("solana#connected", onWalletChange);
      window.removeEventListener("solana#disconnected", onWalletChange);
    };
  }, [isAdmin, walletConnected, currentWallet]); // Restore these dependencies

  // Modify the headers to include wallet address if available
  const headers = {
    "x-admin-wallet": adminPublicKey,
    // Add the current wallet to the headers for verification on the server side
    ...(currentWallet && { "x-current-wallet": currentWallet }),
  };

  const fetchData = async () => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      setError("");

      console.log("Fetching admin data with headers:", headers);

      // Fix duplicate /api/ prefix - remove /api from the URL
      const usersResponse = await axios.get("/admin/users", { headers });
      const requestsResponse = await axios.get("/admin/subsidy-requests", {
        headers,
      });

      console.log("Users response:", usersResponse.data);
      console.log("Requests response:", requestsResponse.data);

      if (usersResponse.data.success) {
        setUsers(usersResponse.data.users);
      } else {
        setError("Failed to load users: " + usersResponse.data.message);
      }

      if (requestsResponse.data.success) {
        setSubsidyRequests(requestsResponse.data.requests);
      } else {
        setError("Failed to load requests: " + requestsResponse.data.message);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        "Failed to load data: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      console.log("Admin confirmed, fetching data...");
      fetchData();
    }
  }, [isAdmin]);

  const handleVerifyKYC = async (userId, approve) => {
    try {
      // For rejections, collect reason first
      if (!approve && !kycRejectionReason && rejectingKycUserId !== userId) {
        setRejectingKycUserId(userId);
        return;
      }

      const payload = {
        approved: approve,
      };

      // Add rejection reason if rejecting
      if (!approve) {
        payload.rejectionReason = kycRejectionReason;
      }

      await axios.put(`/admin/verify-kyc/${userId}`, payload, { headers });

      // Reset rejection form
      setKycRejectionReason("");
      setRejectingKycUserId(null);

      fetchData();
    } catch (err) {
      setError(
        "Failed to update KYC status: " +
          (err.response?.data?.message || err.message)
      );
      console.error(err);
    }
  };

  const handleProcessSubsidy = async (requestId, approve) => {
    try {
      // For rejections, collect reason first
      if (!approve && !rejectionReason && rejectingRequestId !== requestId) {
        setRejectingRequestId(requestId);
        return;
      }

      const payload = {
        approved: approve,
      };

      // Add rejection reason if rejecting
      if (!approve) {
        payload.rejectionReason = rejectionReason;
      }

      console.log(
        `Sending request to: /api/admin/process-subsidy/${requestId}`
      );

      // Make sure to use the API endpoint that starts with /api/
      await axios.put(`/admin/process-subsidy/${requestId}`, payload, {
        headers,
      });

      // Reset rejection form
      setRejectionReason("");
      setRejectingRequestId(null);

      // Refresh data
      fetchData();
    } catch (err) {
      setError(
        "Failed to process subsidy request: " +
          (err.response?.data?.message || err.message)
      );
      console.error(err);
    }
  };

  // Show message if not admin
  if (!walletConnected) {
    return (
      <div className="admin-container">
        <h2>Admin Panel</h2>
        <div className="info-box auth-info-box">
          <h3>Authentication Required</h3>
          <p>Please connect your admin wallet to access the admin panel.</p>
          <div className="wallet-address-container">
            <div className="wallet-address-item">
              <span className="wallet-label">Current wallet:</span>
              <span className="wallet-value not-connected">Not connected</span>
            </div>
            <div className="wallet-address-item">
              <span className="wallet-label">Admin wallet:</span>
              <span className="wallet-value admin-wallet">
                {adminPublicKey}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-container">
        <h2>Admin Panel</h2>
        <div className="error-message auth-error">
          <div className="auth-message-container">
            <h3>Unauthorized Access</h3>
            <p>Only the admin wallet can access this panel.</p>
          </div>
          <div className="wallet-address-container">
            <div className="wallet-address-item">
              <span className="wallet-label">Current wallet:</span>
              <span className="wallet-value">{currentWallet}</span>
            </div>
            <div className="wallet-address-item">
              <span className="wallet-label">Admin wallet:</span>
              <span className="wallet-value admin-wallet">
                {adminPublicKey}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h2>Admin Panel</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-tabs">
        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          User KYC Verification
        </button>
        <button
          className={activeTab === "subsidies" ? "active" : ""}
          onClick={() => setActiveTab("subsidies")}
        >
          Subsidy Requests
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {activeTab === "users" && (
            <div className="users-table">
              <h3>Users waiting for KYC verification</h3>
              {users.filter((user) => user.kycDocumentUrl && !user.kycVerified)
                .length === 0 ? (
                <p>No users waiting for KYC verification</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Wallet</th>
                      <th>Document</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(
                        (user) => user.kycDocumentUrl && !user.kycVerified
                      )
                      .map((user) => (
                        <tr key={user._id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{`${user.walletAddress.slice(
                            0,
                            6
                          )}...${user.walletAddress.slice(-4)}`}</td>
                          <td>
                            <a
                              href={user.kycDocumentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="action-btn"
                            >
                              View Document
                            </a>
                          </td>
                          <td className="action-buttons">
                            {rejectingKycUserId === user._id ? (
                              <div className="rejection-form">
                                <textarea
                                  placeholder="Reason for rejection..."
                                  value={kycRejectionReason}
                                  onChange={(e) =>
                                    setKycRejectionReason(e.target.value)
                                  }
                                  required
                                />
                                <div className="action-buttons">
                                  <button
                                    className="reject-btn"
                                    onClick={() =>
                                      handleVerifyKYC(user._id, false)
                                    }
                                  >
                                    Confirm Reject
                                  </button>
                                  <button
                                    className="submit-btn"
                                    onClick={() => {
                                      setRejectingKycUserId(null);
                                      setKycRejectionReason("");
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <button
                                  className="approve-btn"
                                  onClick={() =>
                                    handleVerifyKYC(user._id, true)
                                  }
                                >
                                  Approve
                                </button>
                                <button
                                  className="reject-btn"
                                  onClick={() =>
                                    setRejectingKycUserId(user._id)
                                  }
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === "subsidies" && (
            <div className="subsidies-table">
              <h3>Pending Subsidy Requests</h3>
              {subsidyRequests.filter((req) => req.status === "pending")
                .length === 0 ? (
                <p>No pending subsidy requests</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Amount (SOL)</th>
                      <th>Reason</th>
                      <th>Requested Date</th>
                      <th>Resubmission</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subsidyRequests
                      .filter((req) => req.status === "pending")
                      .map((request) => (
                        <tr key={request._id}>
                          <td>{request.userId.name}</td>
                          <td>{request.amount}</td>
                          <td>{request.reason}</td>
                          <td>
                            {new Date(request.requestedAt).toLocaleDateString()}
                          </td>
                          <td>
                            {request.isResubmission ? (
                              <div>
                                <span className="status-verified">
                                  Resubmission
                                </span>
                                <p>
                                  <strong>Note:</strong>{" "}
                                  {request.resubmissionNote}
                                </p>
                              </div>
                            ) : (
                              <span className="status-incomplete">No</span>
                            )}
                          </td>
                          <td className="action-buttons">
                            <button
                              className="approve-btn"
                              onClick={() =>
                                handleProcessSubsidy(request._id, true)
                              }
                            >
                              Approve
                            </button>

                            {rejectingRequestId === request._id ? (
                              <div className="rejection-form">
                                <textarea
                                  placeholder="Reason for rejection..."
                                  value={rejectionReason}
                                  onChange={(e) =>
                                    setRejectionReason(e.target.value)
                                  }
                                  required
                                />
                                <div className="action-buttons">
                                  <button
                                    className="reject-btn"
                                    onClick={() =>
                                      handleProcessSubsidy(request._id, false)
                                    }
                                  >
                                    Confirm Reject
                                  </button>
                                  <button
                                    className="submit-btn"
                                    onClick={() => {
                                      setRejectingRequestId(null);
                                      setRejectionReason("");
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                className="reject-btn"
                                onClick={() =>
                                  setRejectingRequestId(request._id)
                                }
                              >
                                Reject
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}

              <h3 className="mt-4">Processed Subsidy Requests</h3>
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Amount (SOL)</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Requested Date</th>
                    <th>Processed Date</th>
                    <th>Transaction</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {subsidyRequests
                    .filter((req) => req.status !== "pending")
                    .map((request) => (
                      <tr key={request._id}>
                        <td>{request.userId.name}</td>
                        <td>{request.amount}</td>
                        <td>
                          <span
                            className={
                              request.status === "approved"
                                ? "status-approved"
                                : "status-rejected"
                            }
                          >
                            {request.status.charAt(0).toUpperCase() +
                              request.status.slice(1)}
                          </span>
                        </td>
                        <td>{request.reason}</td>
                        <td>
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </td>
                        <td>
                          {request.processedAt
                            ? new Date(request.processedAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td>
                          {request.status === "approved" &&
                          request.transactionHash ? (
                            <a
                              href={`https://explorer.solana.com/tx/${request.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="action-btn"
                            >
                              View Transaction
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td>
                          {request.status === "rejected" &&
                          request.rejectionReason ? (
                            <div className="rejection-reason">
                              {request.rejectionReason}
                            </div>
                          ) : request.isResubmission ? (
                            "Resubmitted request"
                          ) : (
                            "N/A"
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPanel;
