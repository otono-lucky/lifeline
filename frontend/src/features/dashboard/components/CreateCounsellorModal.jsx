import React, { useState } from "react";
import { Button, Modal } from "../../../components";
import { churchAdminService } from "../../../api/services";

function CreateCounsellorModal({
  onToast,
  onShowCreateCounselor,
  showCreateCounselor,
  fetchCounselors,
  churches,
}) {
  const [loading, setLoading] = useState(false);
  const [counselorForm, setCounselorForm] = useState({
    churchId: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
    yearsExperience: 0,
  });

  const handleCreateCounselor = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await churchAdminService.createCounselor(counselorForm);
      if (response.success) {
        onToast({
          type: "success",
          message: "Counselor created successfully!",
        });
        setCounselorForm({
          churchId: "",
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          phone: "",
          bio: "",
          yearsExperience: 0,
        });

        onShowCreateCounselor(false);
        if (fetchCounselors) {
          fetchCounselors();
        }
      }
    } catch (error) {
      onToast({ type: "error", message: "Failed to create counselor" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Create Counselor Modal */}
      <Modal
        isOpen={showCreateCounselor}
        onClose={() => onShowCreateCounselor(false)}
        title="Create Counselor"
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => onShowCreateCounselor(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCounselor} disabled={loading}>
              Create
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={counselorForm.churchId}
            onChange={(e) =>
              setCounselorForm({ ...counselorForm, churchId: e.target.value })
            }
            required
          >
            <option value="">Select Church</option>
            {Array.isArray(churches) &&
              churches.map((church) => (
                <option key={church.id} value={church.id}>
                  {church.officialName || church.name}
                </option>
              ))}
          </select>
          <input
            type="text"
            placeholder="First Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={counselorForm.firstName}
            onChange={(e) =>
              setCounselorForm({ ...counselorForm, firstName: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={counselorForm.lastName}
            onChange={(e) =>
              setCounselorForm({ ...counselorForm, lastName: e.target.value })
            }
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={counselorForm.email}
            onChange={(e) =>
              setCounselorForm({ ...counselorForm, email: e.target.value })
            }
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={counselorForm.phone}
            onChange={(e) =>
              setCounselorForm({ ...counselorForm, phone: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={counselorForm.password}
            onChange={(e) =>
              setCounselorForm({ ...counselorForm, password: e.target.value })
            }
            required
          />
          <textarea
            placeholder="Bio"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={counselorForm.bio}
            onChange={(e) =>
              setCounselorForm({ ...counselorForm, bio: e.target.value })
            }
            rows="3"
          />
        </form>
      </Modal>
    </>
  );
}

export default CreateCounsellorModal;
