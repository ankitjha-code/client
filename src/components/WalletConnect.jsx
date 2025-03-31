import React, { useEffect } from "react";

const WalletConnect = ({
  walletConnected,
  setWalletConnected,
  walletAddress,
  setWalletAddress,
  setUser,
}) => {
  useEffect(() => {
    // Check if Phantom is installed
    const checkPhantomWallet = async () => {
      const provider = window.solana;

      if (provider?.isPhantom) {
        console.log("Phantom wallet found!");
      } else {
        alert("Phantom wallet is not installed!");
      }
    };

    checkPhantomWallet();
  }, []);

  const connectWallet = async () => {
    try {
      const provider = window.solana;

      if (provider) {
        const response = await provider.connect();
        const address = response.publicKey.toString();

        setWalletAddress(address);
        setWalletConnected(true);

        // Check if this wallet belongs to a registered user
        try {
          const res = await fetch(
            `https://server-5a30.onrender.com/api/users/wallet/${address}`
          );
          const data = await res.json();

          if (data.success && data.user) {
            setUser(data.user);
          }
        } catch (err) {
          console.error("Error checking wallet:", err);
        }
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  };

  const disconnectWallet = () => {
    if (window.solana) {
      window.solana.disconnect();
      setWalletConnected(false);
      setWalletAddress("");
      setUser(null);
    }
  };

  return (
    <div className="wallet-connect">
      {!walletConnected ? (
        <button onClick={connectWallet} className="connect-btn">
          Connect Wallet
        </button>
      ) : (
        <div className="wallet-info">
          <span>
            {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
          </span>
          <button onClick={disconnectWallet} className="disconnect-btn">
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
