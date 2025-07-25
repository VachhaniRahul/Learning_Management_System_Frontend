import React, { useState, useEffect, useContext } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import UserData from "../plugin/UserData";
import { ProfileContext } from "../plugin/Context";
import api from "../../utils/axios";
import { showToast } from "../../utils/toast";
import Spinner from "../../utils/Spinner";

function Profile() {
    const { teacherProfile, setTeacherProfile } = useContext(ProfileContext);
    const [profileData, setProfileData] = useState({
        image: "",
        full_name: "",
        about: "",
        country: "",
    });
    const [imagePreview, setImagePreview] = useState("");
    const [loading, setLoading] = useState(false)

    const teacherId = UserData()?.teacher_id

    const fetchProfile = async () => {
        setLoading(true)
        try {
            const res = await api.get(`teacher/details/${teacherId}/`)
            console.log(res.data);
            setTeacherProfile(res.data);
            setProfileData(res.data);
            setImagePreview(res.data.image);
            setLoading(false)
        } catch (error) {
            console.log('error', error)
            showToast('error', error.response?.data?.message || 'Something went wrong')
        }

    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleProfileChange = (event) => {
        setProfileData({
            ...profileData,
            [event.target.name]: event.target.value,
        });
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setProfileData({
            ...profileData,
            [event.target.name]: selectedFile,
        });

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };

        if (selectedFile) {
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.get(`teacher/details/${teacherId}/`);
            const formdata = new FormData();
            if (profileData.image && profileData.image !== res.data.image) {
                formdata.append("image", profileData.image);
            }

            formdata.append("full_name", profileData.full_name);
            formdata.append("about", profileData.about);
            formdata.append("country", profileData.country);

            const res1 = await api
                .patch(`teacher/details/${teacherId}/`, formdata, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
            console.log(res1.data);
            setTeacherProfile(res1.data);
            showToast('success', 'Profile Updated')
        } catch (error) {
            console.log('error', error)
            showToast('error', error.response?.data?.message || 'Something went wrong')
        }

    };


    return (
        <>
            <BaseHeader />
            {loading ? <Spinner /> :
            <section className="pt-5 pb-5">
                <div className="container">
                    {/* Header Here */}
                    <Header />
                    <div className="row mt-0 mt-md-4">
                        {/* Sidebar Here */}
                        <Sidebar />
                        <div className="col-lg-9 col-md-8 col-12">
                            {/* Card */}
                            <div className="card">
                                {/* Card header */}
                                <div className="card-header">
                                    <h3 className="mb-0">Profile Details</h3>
                                    <p className="mb-0">You have full control to manage your own account setting.</p>
                                </div>
                                {/* Card body */}
                                <form className="card-body" onSubmit={handleFormSubmit}>
                                    <div className="d-lg-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center mb-4 mb-lg-0">
                                            <img
                                                src={imagePreview}
                                                id="img-uploaded"
                                                className="avatar-xl rounded-circle"
                                                alt="avatar"
                                                style={{
                                                    width: "100px",
                                                    height: "100px",
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                }}
                                            />
                                            <div className="ms-3">
                                                <h4 className="mb-0">Your avatar</h4>
                                                <p className="mb-0">PNG or JPG no bigger than 800px wide and tall.</p>
                                                <input type="file" className="form-control mt-3" name="image" onChange={handleFileChange} id="" />
                                            </div>
                                        </div>
                                    </div>
                                    <hr className="my-5" />
                                    <div>
                                        <h4 className="mb-0">Personal Details</h4>
                                        <p className="mb-4">Edit your personal information and address.</p>
                                        {/* Form */}
                                        <div className="row gx-3">
                                            {/* First name */}
                                            <div className="mb-3 col-12 col-md-12">
                                                <label className="form-label" htmlFor="fname">
                                                    Full Name
                                                </label>
                                                <input type="text" id="fname" className="form-control" placeholder="full name" required="" value={profileData.full_name} onChange={handleProfileChange} name="full_name" />
                                                <div className="invalid-feedback">Please enter full name</div>
                                            </div>
                                            {/* Last name */}
                                            <div className="mb-3 col-12 col-md-12">
                                                <label className="form-label" htmlFor="lname">
                                                    About Me
                                                </label>
                                                <textarea onChange={handleProfileChange} name="about" id="" cols="30" rows="5" className="form-control" value={profileData.about}></textarea>
                                                <div className="invalid-feedback">Please enter about you.</div>
                                            </div>

                                            {/* Country */}
                                            <div className="mb-3 col-12 col-md-12">
                                                <label className="form-label" htmlFor="editCountry">
                                                    Country
                                                </label>
                                                <input type="text" id="country" className="form-control" placeholder="Country" required="" value={profileData.country} onChange={handleProfileChange} name="country" />
                                                <div className="invalid-feedback">Please enter country.</div>
                                            </div>
                                            <div className="col-12">
                                                {/* Button */}
                                                <button className="btn btn-primary" type="submit">
                                                    Update Profile <i className="fas fa-check-circle"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>}

            <BaseFooter />
        </>
    );
}

export default Profile;
