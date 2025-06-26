// src/plugin/ProfileProvider.jsx
import React, { useState, useEffect } from "react";
import { ProfileContext } from "./Context";
import api from "../../utils/axios";
import UserData from "./UserData";
import { showToast } from "../../utils/toast";

export const ProfileProvider = ({ children }) => {
    const [profile, setProfile] = useState(null);
    const [teacherProfile, setTeacherProfile] = useState(null)
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

    useEffect(() => {
        const fetchTeacherProfile = async () => {
            const user_id = UserData()?.teacher_id;

            if (!user_id) {
                setLoading(false);
                return;
            }

            try {
                const res = await api.get(`teacher/details/${user_id}`);
                setTeacherProfile(res.data);
            } catch (err) {
                console.error("Failed to load Teacher profile", err);
                showToast('error', 'Profile not show error');
            } finally {
                setLoading(false);
            }
        };

        fetchTeacherProfile();
    }, []);

    return (
        <ProfileContext.Provider value={{ profile, setProfile, loading, teacherProfile, setTeacherProfile }}>
            {children}
        </ProfileContext.Provider>
    );
};
