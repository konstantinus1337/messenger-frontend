export const decodeToken = (token) => {
    try {
        // JWT токен состоит из трех частей, разделенных точкой
        const payload = token.split('.')[1];
        // Декодируем payload из base64
        const decodedPayload = JSON.parse(atob(payload));
        return decodedPayload;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

export const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const decodedToken = decodeToken(token);
    return decodedToken?.id || null;
};