// Store tokens in localStorage
function storeTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
}

// Get the access token from storage
function getAccessToken() {
    return localStorage.getItem('accessToken');
}

// Get the refresh token from storage
function getRefreshToken() {
    return localStorage.getItem('refreshToken');
}

// Function to refresh the access token using the refresh token
async function refreshAccessToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token available");

    const response = await fetch('http://127.0.0.1:8000/user/refresh_jwt', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
			'Authorization': `Bearer ${refreshToken}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to refresh access token");
    }

    const data = await response.json();
    const newAccessToken = data.access_token;
    const newRefreshToken = data.refresh_token;

    // Store the new tokens
    storeTokens(newAccessToken, newRefreshToken);
    
    return newAccessToken;
}

// Function to make an authenticated request
async function authenticatedRequest(url, options = {}) {
    let accessToken = getAccessToken();

    // Add the access token to the request headers
    options.headers = {
        ...options.headers, // Combine previous header with current (spread syntax)
        'Authorization': `Bearer ${accessToken}`
    };

    let response = await fetch(url, options);

    // If the access token has expired, refresh it and retry the request
    if (response.status == 401) {
        try {
            accessToken = await refreshAccessToken();
            // Retry the original request with the new access token
            options.headers['Authorization'] = `Bearer ${accessToken}`;
            response = await fetch(url, options);
        }
		catch (error) {
            // Handle the error (e.g., log out the user)
            console.error("Failed to refresh token", error);
        }
    }

    return response;
}