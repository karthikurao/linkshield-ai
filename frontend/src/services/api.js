// frontend/src/services/api.js
import { Amplify } from 'aws-amplify'; // <-- Make sure Amplify is imported if not already
import { fetchAuthSession } from 'aws-amplify/auth'; // <-- Import function to get session tokens

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ... (your existing scanUrlApi and getHistoryApi functions are here) ...

export const scanUrlApi = async (urlToScan) => {
  // ... (no changes to this function)
  const endpoint = `${API_BASE_URL}/api/v1/predict`;
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}` // Add auth token to predict calls
      },
      body: JSON.stringify({ url: urlToScan }),
    });
    if (response.ok) return await response.json();
    else { /* ... error handling ... */ }
  } catch (error) { /* ... error handling ... */ }
};

// New function to get detailed factor analysis
export const getFactorAnalysisApi = async (urlToScan) => {
  const endpoint = `${API_BASE_URL}/api/factors/analyze`;
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ url: urlToScan }),
    });
    
    if (response.ok) {
      const data = await response.json();
      // Ensure we have the factors array available
      return {
        ...data,
        status: data.prediction, // Map prediction to status for compatibility
        message: data.prediction === 'benign' 
          ? 'URL appears to be safe' 
          : 'URL appears to be malicious'
      };
    } else {
      throw new Error(`Failed to analyze URL: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Factor analysis API error:', error);
    throw error;
  }
};

export const getHistoryApi = async (limit = 10) => {
    // ... (no changes to this function)
  const endpoint = `${API_BASE_URL}/api/v1/history?limit=${limit}`;
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    const response = await fetch(endpoint, { 
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${idToken}` // Add auth token to history calls
        }
    });
    if (response.ok) return await response.json();
    else { /* ... error handling ... */ }
  } catch (error) { /* ... error handling ... */ }
};


/**
 * --- NEW FUNCTION ---
 * Sends updated user profile data to the backend.
 * @param {object} profileData - The data to update, e.g., { name: "New Name", email: "new@example.com" }.
 * @returns {Promise<object>} A promise that resolves to the success response from the backend.
 */
export const updateUserProfileApi = async (profileData) => {
  const endpoint = `${API_BASE_URL}/api/v1/profile/me`;

  try {
    // Get the current user's session token to authorize the request
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    if (!idToken) {
      throw new Error("User session not found. Please log in again.");
    }    // Filter out any empty or undefined values before sending
    const cleanData = {};
    for (const key in profileData) {
      if (profileData[key] !== undefined && profileData[key] !== '') {
        cleanData[key] = profileData[key];
      }
    }

    // Only proceed if there are values to update
    if (Object.keys(cleanData).length === 0) {
      return { status: "info", message: "No changes to update" };
    }

    const response = await fetch(endpoint, {
      method: 'PUT', // Use PUT for updating resources
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}` // Send the token in the Authorization header
      },
      body: JSON.stringify(cleanData),
    });

    if (response.ok) {
      return await response.json();
    } else {
      const errorData = await response.json().catch(() => ({ error: `Failed to update profile. Status: ${response.status}` }));
      const error = new Error(errorData.error);
      throw error;
    }
  } catch (error) {
    console.error('API profile update failed:', error);
    throw new Error(error.message || 'Network error while updating profile.');
  }
};