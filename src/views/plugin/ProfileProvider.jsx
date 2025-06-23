// src/plugin/ProfileProvider.jsx
import React, { useState, useEffect } from "react";
import { ProfileContext } from "./Context";
import api from "../../utils/axios";
import UserData from "./UserData";
import { showToast } from "../../utils/toast";

export const ProfileProvider = ({ children }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const user_id = UserData()?.user_id;

            if (!user_id) {
                setLoading(false);
                return;
            }

            try {
                const res = await api.get(`user/profile/${user_id}`);
                setProfile(res.data);
            } catch (err) {
                console.error("Failed to load profile", err);
                showToast('error', 'Profile not show error');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    return (
        <ProfileContext.Provider value={{ profile, setProfile, loading }}>
            {children}
        </ProfileContext.Provider>
    );
};
