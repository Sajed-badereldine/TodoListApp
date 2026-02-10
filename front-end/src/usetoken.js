    import { useState } from 'react';

    export const useToken = () => {
    const getToken = () => localStorage.getItem('token');

    const [token, setTokenState] = useState(getToken());

    const setToken = (newToken) => {
        if (newToken === null) {
        localStorage.removeItem('token');
        setTokenState(null);
        } else {
        localStorage.setItem('token', newToken);
        setTokenState(newToken);
        }
    };

    return [token, setToken];
    };
