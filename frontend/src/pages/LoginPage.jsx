// frontend/src/pages/LoginPage.jsx
import React, { useEffect } from 'react';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginPage = () => {
    const { authStatus } = useAuthenticator(context => [context.authStatus]);
    const navigate = useNavigate();
    const location = useLocation();

    // After a successful login, navigate the user back to the home page.
    useEffect(() => {
        if (authStatus === 'authenticated') {
            navigate("/", { replace: true });
        }
    }, [authStatus, navigate]);
    
    return (
        <div className="flex justify-center items-center min-h-screen">
             <Authenticator
                signUpAttributes={['name']}
                loginMechanisms={['email']}
             />
        </div>
    );
};

export default LoginPage;