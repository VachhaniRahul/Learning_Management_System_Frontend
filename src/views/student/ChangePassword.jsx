import React, { useState } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import UserData from "../plugin/UserData";
import api from "../../utils/axios";
import { showToast } from "../../utils/toast";

function ChangePassword() {
    const [password, setPassword] = useState({
        old_password: "",
        new_password: "",
        confirm_new_password: "",
    });

    const [loading, setLoading] = useState(false);

    const handlePasswordChange = (event) => {
        setPassword({
            ...password,
            [event.target.name]: event.target.value,
        });
    };

    const changePasswordSubmit = async (e) => {
        e.preventDefault();

        if (password.confirm_new_password !== password.new_password) {
            showToast("error", "Password does not match");
            return;
        }

        const formdata = new FormData();
        formdata.append("user_id", UserData()?.user_id);
        formdata.append("old_password", password.old_password);
        formdata.append("new_password", password.new_password);

        setLoading(true);

        try {
            const res = await api.post(`user/change-password/`, formdata);
            console.log(res.data);
            showToast("success", "Password Changed Successfully");
            setPassword({
                old_password: "",
                new_password: "",
                confirm_new_password: "",
            });
        } catch (error) {
            console.log("error", error);
            showToast("error", error.response?.data?.message || "Something went wrong");
        }

        setLoading(false);
    };

    return (
        <>
            <BaseHeader />
            <section className="pt-5 pb-5">
                <div className="container">
                    <Header />
                    <div className="row mt-0 mt-md-4">
                        <Sidebar />
                        <div className="col-lg-9 col-md-8 col-12">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="mb-0">Change Password</h3>
                                </div>
                                <div className="card-body">
                                    <form className="row gx-3 needs-validation" noValidate onSubmit={changePasswordSubmit}>
                                        <div className="mb-3 col-12 col-md-12">
                                            <label className="form-label">Old Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                placeholder="**************"
                                                required
                                                name="old_password"
                                                value={password.old_password}
                                                onChange={handlePasswordChange}
                                            />
                                        </div>

                                        <div className="mb-3 col-12 col-md-12">
                                            <label className="form-label">New Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                placeholder="**************"
                                                required
                                                name="new_password"
                                                value={password.new_password}
                                                onChange={handlePasswordChange}
                                            />
                                        </div>

                                        <div className="mb-3 col-12 col-md-12">
                                            <label className="form-label">Confirm New Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                placeholder="**************"
                                                required
                                                name="confirm_new_password"
                                                value={password.confirm_new_password}
                                                onChange={handlePasswordChange}
                                            />
                                        </div>

                                        <div className="col-12">
                                            <button className="btn btn-primary" type="submit" disabled={loading}>
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        Save New Password <i className="fas fa-check-circle"></i>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <BaseFooter />
        </>
    );
}

export default ChangePassword;
