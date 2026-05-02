import { createContext, useState, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiX, FiShoppingBag, FiMail, FiLock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './LoginPopup.css';

const LoginPopupContext = createContext();
export const useLoginPopup = () => useContext(LoginPopupContext);

export const LoginPopupProvider = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [onSuccessCallback, setOnSuccessCallback] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const showLoginPopup = useCallback((onSuccess) => {
        setEmail('');
        setPassword('');
        setOnSuccessCallback(() => onSuccess || null);
        setVisible(true);
    }, []);

    const hideLoginPopup = () => setVisible(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await login(email, password);
            const role = data?.user?.role;
            toast.success('Logged in!');
            setVisible(false);
            if (onSuccessCallback) {
                onSuccessCallback(data.user);
            } else {
                if (role === 'admin') navigate('/admin');
                else if (role === 'seller') navigate('/seller');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        }
        setLoading(false);
    };

    return (
        <LoginPopupContext.Provider value={{ showLoginPopup }}>
            {children}
            {visible && (
                <div className="login-popup-overlay" onClick={hideLoginPopup}>
                    <div className="login-popup-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="login-popup-header">
                            <div className="login-popup-icon"><FiShoppingBag /></div>
                            <div>
                                <h3>Sign in to continue</h3>
                                <p>Login to add to cart & place orders</p>
                            </div>
                            <button className="login-popup-close" onClick={hideLoginPopup}><FiX /></button>
                        </div>

                        <form onSubmit={handleLogin} className="login-popup-form">
                            <div className="popup-input-group">
                                <FiMail />
                                <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
                            </div>
                            <div className="popup-input-group">
                                <FiLock />
                                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                            <button type="submit" className="popup-login-btn" disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign In & Continue'}
                            </button>
                        </form>

                        <div className="login-popup-footer">
                            <p>New customer? <a href="/register" onClick={(e) => { e.preventDefault(); hideLoginPopup(); navigate('/register'); }}>Create account</a></p>
                        </div>
                    </div>
                </div>
            )}
        </LoginPopupContext.Provider>
    );
};
