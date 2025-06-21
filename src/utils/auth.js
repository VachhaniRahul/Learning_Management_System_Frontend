import { useAuthStore } from "../store/auth";
import api from "./axios";
import jwtDecode from 'jwt-decode';
import Cookie from 'js-cookie'
import { showToast } from "./toast";

export const login = async (email, password) => {
    try {
        const { data, status } = await api.post('user/token/', {
            email,
            password
        })
        if (status === 200) {
            setAuthUser(data.access, data.refresh)
            // alert('Login Successfull')
            showToast('success', 'Login Successful')
        }
        return { data, error: null }
    } catch (error) {
        console.log(error)
        return {
            data: null,
            error: error.response?.data?.detail || 'Something went wrong'
        }
    }
};



export const register = async (full_name, email, password, confirm_password) => {
    try {
        const { data } = await api.post('user/register/', {
            full_name,
            email,
            password,
            confirm_password
        });

        await login(email, password);

        // alert('Register Successfull')
        showToast('success', 'Registration Successfull')

        return { data, error: null }

    } catch (error) {
        console.log(error);
        return {
            data: null,
            error: error.response.data?.email || error.response.data?.password || 'Something went wrong'
        }
    }
}


export const logout = () => {
    Cookie.remove('access_token')
    Cookie.remove('refresh_token')
    useAuthStore.getState().setUser(null)
    // alert('You have been logged out')
    showToast('success', 'You have been logged out')
};


export const setUser = async () => {
    const access_token = Cookie.get('access_token')
    const refresh_token = Cookie.get('refresh_token')

    if (!access_token || !refresh_token) {
        // alert('Tokens does not exists')
        return
    }

    if (isAccessTokenExpired(access_token)) {
        const response = await getRefreshToken(refresh_token)
        setAuthUser(response.access, refresh_token)
    }
    else {
        setAuthUser(access_token, refresh_token)
    }
}

export const setAuthUser = async (access_token, refresh_token) => {
    Cookie.set('access_token', access_token, {
        expires: 1,
        secure: true
    })
    Cookie.set('refresh_token', refresh_token, {
        expires: 7,
        secure: true
    })

    const user = jwtDecode(access_token) ?? null

    if (user) {
        useAuthStore.getState().setUser(user)
    }

    useAuthStore.getState().setLoading(false)
}



export const getRefreshToken = async (refresh_token) => {
    const response = await api.post('user/token/refresh/', {
        'refresh': refresh_token
    })

    return response.data
}



export const isAccessTokenExpired = (access_token) => {
    try {
        const decodedToken = jwtDecode(access_token)
        return decodedToken.exp < Date.now() / 1000
    } catch (error) {
        console.log(error)
        return true
    }
}






