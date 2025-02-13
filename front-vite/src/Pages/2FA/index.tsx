import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../Providers/UserContext/User';

const TwoFactorAuth = () => {
	const [token, setToken] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [qrCodeUrl, setQrCodeUrl] = useState('');
	const navigate = useNavigate();
	const intraId = useUser().user.intraId;

	useEffect(() => {
		if (!intraId) {
			console.error("intraId is missing! Redirecting to login.");
			navigate('/login');
			return;
		}
		
		const check2FAStatus = async () => {
			try {
				console.log(`Checking intraId: ${intraId}`);
				const response = await axios.get(import.meta.env.URL_BACKEND_2FA_STATUS + `?intraId=${intraId}`, {
					withCredentials: true,
				});
				console.log("Its ok after the 2fa status func");
				if (!response.data.is2FAEnabled) {
					// If 2FA is not enabled, generate the QR code
					generateQRCode();
				}
			} catch (err) {
				console.error('Error checking 2FA status:', err);
				navigate('/login'); // Redirect if API fails
			}
		};

		const generateQRCode = async () => {
			try {
				const response = await axios.get(import.meta.env.URL_BACKEND_GENERATE_2FA + `?intraId=${intraId}`, {
					withCredentials: true,
				});
				setQrCodeUrl(response.data.qrCodeUrl); // Store QR code image URL
			} catch (err) {
				console.error('Error generating QR code:', err);
				setError('Failed to generate QR code. Please try again.');
			}
		};

		check2FAStatus();
	}, [navigate, intraId]);

	const handleVerify2FA = async () => {
		if (!token) {
			setError('Please enter a valid 2FA code.');
			return;
		}

		setLoading(true);
		setError('');

		try {
			const response = await axios.post(
				import.meta.env.URL_BACKEND_VERIFY_2FA,
				{ intraId, token },
				{ withCredentials: true }
			);

			if (response.status === 200) {
				navigate('/dashboard'); // Redirect after successful verification
			}
		} catch (err) {
			console.error('2FA Verification Error:', err);
			setError('Invalid 2FA code. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<h1 className="text-2xl font-bold">Two-Factor Authentication</h1>

			{qrCodeUrl ? (
				<>
					<p className="text-gray-600 mb-4">Scan this QR code with your authenticator app:</p>
					<img src={qrCodeUrl} alt="2FA QR Code" className="mb-4 border rounded-lg" />
				</>
			) : (
				<>
					<p className="text-gray-600 mb-4">Enter your authentication code</p>
					<input
						type="text"
						value={token}
						onChange={(e) => setToken(e.target.value)}
						placeholder="Enter 2FA Code"
						className="p-2 border rounded-md"
					/>
					{error && <p className="text-red-500">{error}</p>}

					<button
						onClick={handleVerify2FA}
						disabled={loading}
						className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
					>
						{loading ? 'Verifying...' : 'Verify'}
					</button>
				</>
			)}
		</div>
	);
};

export default TwoFactorAuth;
