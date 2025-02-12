import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const TwoFactorAuth = () => {
    const [token, setToken] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const intraId = searchParams.get("intraId"); // Get intraId from URL

    const handleVerify2FA = async () => {
        try {
            const response = await axios.post(import.meta.env.URL_BACKEND_2FA, {
                intraId,
                token,
            }, { withCredentials: true });

            if (response.status === 200) {
                console.log("2FA verified, redirecting...");
                navigate("/dashboard");
            }
        } catch (error) {
            setError("Invalid 2FA token. Please try again.");
        }
    };

    return (
        <div>
            <h2>Two-Factor Authentication</h2>
            <p>Enter your authentication code:</p>
            <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter 2FA code"
            />
            <button onClick={handleVerify2FA}>Verify</button>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default TwoFactorAuth;
