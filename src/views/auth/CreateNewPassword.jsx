import { useState, useEffect } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import api from "../../utils/axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { showToast } from "../../utils/toast";

function CreateNewPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParam] = useSearchParams();

  const otp = searchParam.get("otp");
  const uuid64 = searchParam.get("uuid64");
  const refresh_token = searchParam.get("refresh_token");

  const handleCreatePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (confirmPassword !== password) {
      showToast('error', 'Password didn\'t match')
      setIsLoading(false)
      return;
    } else {

      try {
        console.log(otp, uuid64, password, refresh_token); // Should not be undefined/null
        const res = await api.post(`user/password-reset/`, {
          password,
          otp,
          uuid64,
          refresh_token
        })
        console.log(res.data);
        if (res.status === 200) {
          navigate("/login");
          showToast('success', res.data.message)
        }

      } catch (error) {
        console.log(error);
        const err = error.response?.data;

        if (err) {
          const messages = Object.entries(err).map(([field, value]) => {
            const msg = Array.isArray(value) ? value[0] : value;
            return `${field.toUpperCase()}: ${msg}`;
          });

          showToast("error", messages.join("\n")); // or use <br/> if it's HTML-based
        } else {
          showToast("error", "Something went wrong");
        }
      }
      finally {
        setIsLoading(false)
      }
    }
  };
  return (
    <>
      <BaseHeader />

      <section
        className="container d-flex flex-column vh-100"
        style={{ marginTop: "150px" }}
      >
        <div className="row align-items-center justify-content-center g-0 h-lg-100 py-8">
          <div className="col-lg-5 col-md-8 py-8 py-xl-0">
            <div className="card shadow">
              <div className="card-body p-6">
                <div className="mb-4">
                  <h1 className="mb-1 fw-bold">Create New Password</h1>
                  <span>Choose a new password for your account</span>
                </div>
                <form
                  className="needs-validation"
                  noValidate=""
                  onSubmit={handleCreatePassword}
                >
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Enter New Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      name="password"
                      placeholder="**************"
                      required
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="invalid-feedback">
                      Please enter valid password.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      name="password"
                      placeholder="**************"
                      required
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <div className="invalid-feedback">
                      Please enter valid password.
                    </div>
                  </div>

                  <div>
                    <div className="d-grid">
                      {isLoading === true && (
                        <button
                          disabled
                          type="submit"
                          className="btn btn-primary"
                        >
                          Processing <i className="fas fa-spinner fa-spin"></i>
                        </button>
                      )}

                      {isLoading === false && (
                        <button type="submit" className="btn btn-primary">
                          Save New Password{" "}
                          <i className="fas fa-check-circle"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BaseFooter />
    </>
  );
}

export default CreateNewPassword;
