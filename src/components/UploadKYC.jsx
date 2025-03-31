import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UploadKYC = ({ user, setUser }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [kycHistory, setKycHistory] = useState(null);
  const [resubmissionNote, setResubmissionNote] = useState("");
  const [isResubmission, setIsResubmission] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (user && user._id) {
      fetchKycHistory();
    }
  }, [user]);

  const fetchKycHistory = async () => {
    try {
      const response = await axios.get(`/users/kyc-history/${user._id}`);
      if (response.data.success) {
        setKycHistory(response.data.kycHistory);

        // Check if the latest submission was rejected
        const submissions = response.data.kycHistory.submissions || [];
        if (submissions.length > 0) {
          const latestSubmission = submissions[submissions.length - 1];
          if (latestSubmission.status === "rejected") {
            setIsResubmission(true);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching KYC history:", err);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a document to upload");
      return;
    }

    if (!user) {
      setError("Please register or sign in first");
      return;
    }

    // Check if this is a resubmission and require a note
    if (isResubmission && !resubmissionNote) {
      setError("Please explain how you've addressed the rejection reason");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("document", file);

      // Add resubmission flag and note if applicable
      if (isResubmission) {
        formData.append("isResubmission", "true");
        formData.append("resubmissionNote", resubmissionNote);
      }

      const response = await axios.post(
        `/users/upload-kyc/${user._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        const updatedUser = {
          ...user,
          kycDocumentUrl: response.data.documentUrl,
        };
        setUser(updatedUser);
        setSuccess(
          "Document uploaded successfully! Waiting for admin verification."
        );

        // Refresh KYC history
        fetchKycHistory();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="kyc-container">
        <h2>Upload KYC Document</h2>
        <p>Please register or sign in first to upload KYC documents.</p>
        <button onClick={() => navigate("/register")} className="action-btn">
          Go to Registration
        </button>
      </div>
    );
  }

  if (user.kycVerified) {
    return (
      <div className="kyc-container">
        <h2>KYC Status</h2>
        <div className="success-message">
          Your KYC has been verified! You can now request subsidies.
        </div>
        <button
          onClick={() => navigate("/request-subsidy")}
          className="action-btn"
        >
          Request Subsidy
        </button>
      </div>
    );
  }

  // Get the last rejected submission, if any
  const getLastRejectedSubmission = () => {
    if (
      !kycHistory ||
      !kycHistory.submissions ||
      kycHistory.submissions.length === 0
    ) {
      return null;
    }

    const rejectedSubmissions = kycHistory.submissions.filter(
      (s) => s.status === "rejected"
    );

    if (rejectedSubmissions.length === 0) {
      return null;
    }

    return rejectedSubmissions[rejectedSubmissions.length - 1];
  };

  const lastRejectedSubmission = getLastRejectedSubmission();

  return (
    <div className="kyc-container">
      <h2>Upload KYC Document</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {isResubmission && lastRejectedSubmission && (
        <div className="rejection-info">
          <h3>Your previous KYC submission was rejected</h3>
          <p>
            <strong>Rejection Reason:</strong>{" "}
            {lastRejectedSubmission.rejectionReason || "No reason provided"}
          </p>
          <p>
            Please address the issues before resubmitting your KYC document.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="document">
            Identity Document (Passport, ID Card, Aadhaar)
          </label>
          <input
            type="file"
            id="document"
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.pdf"
            required
            className="file-input"
          />
          <p className="help-text">
            Supported formats: JPG, PNG, PDF. Max size: 5MB
          </p>
        </div>

        {isResubmission && (
          <div className="form-group">
            <label htmlFor="resubmissionNote">
              Explain how you've addressed the rejection reason
            </label>
            <textarea
              id="resubmissionNote"
              value={resubmissionNote}
              onChange={(e) => setResubmissionNote(e.target.value)}
              required
              rows={3}
              placeholder="Explain how you've fixed the issues..."
            />
          </div>
        )}

        {user.kycDocumentUrl && !isResubmission && (
          <div className="info-text">
            <p>
              You have already uploaded a document and it's pending
              verification.
            </p>
            <p>Upload again to replace your current submission.</p>
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Uploading..." : "Upload Document"}
        </button>
      </form>
    </div>
  );
};

export default UploadKYC;
