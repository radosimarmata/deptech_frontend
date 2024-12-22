"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftEndOnRectangleIcon, DocumentPlusIcon, DocumentTextIcon, PencilSquareIcon, TrashIcon, UserIcon, UserPlusIcon } from "@heroicons/react/24/outline";

export default function Dashboard() {
  const [openAdmin, setOpenAdmin] = useState(false);
  const [adminData, setAdminData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthDate: "",
    gender: "",
    password: ""
  });
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null); 
  const [isAdding, setIsAdding] = useState(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false); 
  const [openAddLeaveDialog, setOpenAddLeaveDialog] = useState<boolean>(false); 
  const [leaves, setLeaves] = useState<any[]>([]);
  const [openLeaveDialog, setOpenLeaveDialog] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    gender: "",
  }); 
  const [formLeave, setFormLeave] = useState({
    employeeId: 0,
    reason: "",
    startDate: "",
    endDate: "",
  }); 
  const router = useRouter();

  const fetchEmployees = async (dataToken: string) => {
    try {
      const response = await fetch("http://localhost:3000/employees", {
        headers: {
          Authorization: `Bearer ${dataToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }
      const data = await response.json();
      setEmployees(data);
    } catch (err: any) {
      setError(err.message);
      router.push("/");
      return;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/");
      return;
    }

    if(token) fetchEmployees(token);
  }, [router]);

  const handleAddClick = () => {
    setIsAdding(true);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
      gender: "male",
    });
    setOpenDialog(true);
  };

  const handleEditClick = (employee: any) => {
    setSelectedEmployee(employee);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phoneNumber: employee.phoneNumber,
      address: employee.address,
      gender: employee.gender?.name,
    });
    setOpenDialog(true);
  };

  const fetchLeaves = async (employeeId: string, dataToken: string) => {
    try {
      const response = await fetch(`http://localhost:3000/leave-requests/employee/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${dataToken}`,
        },
      });

      const data = await response.json();
      setLeaves(data);
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const handleAnnualLeaveClick = async (employeeId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    fetchLeaves(employeeId, token);
    setOpenLeaveDialog(true);
    setFormLeave({
      ...formLeave,
      employeeId: parseInt(employeeId),
    })
  };

  const handleOpenAddLeaveDialog = () => {
    setOpenAddLeaveDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenLeaveDialog(false);
  };

  const handleCloseAddLeaveDialog = () => {
    setOpenAddLeaveDialog(false);
    setFormLeave({
      ...formLeave,
      startDate: '',
      endDate: '',
      reason: ''
    });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangeLeave = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormLeave({
      ...formLeave,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const employeeData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      genderId: formData.gender === "male" ? 1 : 2
    };

    try {
      let response;
      if(isAdding){
        response = await fetch("http://localhost:3000/employees", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(employeeData),
        });
      } else {
        response = await fetch(`http://localhost:3000/employees/${selectedEmployee.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) {
        throw new Error(isAdding ? "Failed to add employee" : "Failed to update employee");
      }
      setOpenDialog(false);
      fetchEmployees(token);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteClick = async (employeeId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3000/employees/${employeeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete employee");
      }
      fetchEmployees(token);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const response = await fetch("http://localhost:3000/leave-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formLeave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || response.statusText);
        console.log("Error:", errorData.message || response.statusText);
        return
      }
      fetchLeaves(`${formLeave.employeeId}`, token);
      setSuccessMessage("Leave request submitted successfully");
      handleCloseAddLeaveDialog();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteLeave = async (leaveId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3000/leave-requests/${leaveId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete leave request");
      }

      setLeaves((prevLeaves) => prevLeaves.filter((leave) => leave.id !== leaveId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSignout = async () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("admin");
    router.push("/");
    return;
  }

  const handleOpenAdmin = async () => {
    setOpenAdmin(true);
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      let admin = localStorage.getItem("admin")
      if (!admin) {
        throw new Error("Admin data not found.");
      }
      const parsedAdmin = JSON.parse(admin) as { id: string };

      if (!parsedAdmin.id) {
        throw new Error("Admin ID is missing.");
      }

      const adminid = parsedAdmin.id;
      const response = await fetch(`http://localhost:3000/admin/${adminid}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      setAdminData(data);
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      let admin = localStorage.getItem("admin");

      if (!admin) {
        throw new Error("Admin data not found.");
      }

      const parsedAdmin = JSON.parse(admin) as { id: string };

      if (!parsedAdmin.id) {
        throw new Error("Admin ID is missing.");
      }

      const adminid = parsedAdmin.id;
      const response = await fetch(`http://localhost:3000/admin/${adminid}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adminData),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile data.");
      }
  
      const updatedData = await response.json();
      setOpenAdmin(false);
    } catch (error: any) {
      console.error("Error saving profile:", error.message);
    }
  }
  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="p-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex">
          <button onClick={() => handleOpenAdmin()} className="border p-2 rounded-md bg-blue-300 text-sm"><UserIcon className="h-6 w-6" /></button>
          <button onClick={() => handleSignout()} className="border p-2 rounded-md bg-red-700 text-sm">
            <ArrowLeftEndOnRectangleIcon className="h-6 w-6" />
          </button>
        </div>
        <h1 className="text-center text-2xl font-bold flex-1">Employee Dashboard</h1>
        <button onClick={() => handleAddClick()} className="border p-2 mb-2 rounded-full text-green-500">
          <UserPlusIcon className="h-6 w-6"/>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">No</th>
              <th className="border border-gray-300 px-4 py-2">First Name</th>
              <th className="border border-gray-300 px-4 py-2">Last Name</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Phone</th>
              <th className="border border-gray-300 px-4 py-2">Address</th>
              <th className="border border-gray-300 px-4 py-2">Gender</th>
              <th className="border border-gray-300 px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, idx) => (
              <tr key={employee.id}>
                <td className="border border-gray-300 px-4 py-2">{idx + 1}</td>
                <td className="border border-gray-300 px-4 py-2">{employee.firstName}</td>
                <td className="border border-gray-300 px-4 py-2">{employee.lastName}</td>
                <td className="border border-gray-300 px-4 py-2">{employee.email}</td>
                <td className="border border-gray-300 px-4 py-2">{employee.phoneNumber}</td>
                <td className="border border-gray-300 px-4 py-2">{employee.address}</td>
                <td className="border border-gray-300 px-4 py-2">{employee.gender?.name}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    className="ml-2 text-yellow-500"
                    onClick={() => handleAnnualLeaveClick(employee.id)}
                  >
                    <DocumentTextIcon className="h-6 w-6"/>
                  </button>
                  <button onClick={() => handleEditClick(employee)} className="text-blue-500">
                    <PencilSquareIcon className="h-6 w-6" />
                  </button>
                  <button onClick={() => handleDeleteClick(employee.id)} className="ml-2 text-red-500">
                    <TrashIcon className="h-6 w-6" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-2xl font-bold mb-4">{isAdding ? "Add New Employee" : "Edit Employee"} Employee</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                className="w-full mb-3 p-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className="w-full mb-3 p-2 border border-gray-300 rounded-lg"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full mb-3 p-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone"
                className="w-full mb-3 p-2 border border-gray-300 rounded-lg"
              />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                className="w-full mb-3 p-2 border border-gray-300 rounded-lg"
              />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full mb-3 p-2 border border-gray-300 rounded-lg"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  {isAdding ? "Add" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {openLeaveDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-2xl font-bold mb-4">Leave Requests</h2>
            <button 
            onClick={handleOpenAddLeaveDialog} className="text-blue-500">Add<DocumentPlusIcon className="h-6 w-6"/></button>
            <ul className="list-disc pl-5">
              {leaves.length > 0 ? (
                leaves.map((leave) => (
                  <li key={leave.id} className="mb-2">
                    <p><strong>Start Date:</strong> {leave.startDate}</p>
                    <p><strong>End Date:</strong> {leave.endDate}</p>
                    <p><strong>Reason:</strong> {leave.reason}</p>
                    <button
                    onClick={() => handleDeleteLeave(leave.id)}
                    className="text-red-500"><TrashIcon className="h-6 w-6"/></button>
                  </li>
                ))
              ) : (
                <p>No leave requests yet.</p>
              )}
            </ul>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleCloseDialog}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {openAddLeaveDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-2xl font-bold mb-4">Add Annual Leave</h2>
            {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
            {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

            <form onSubmit={handleSubmitLeave}>
              <input
                type="text"
                name="reason"
                value={formLeave.reason}
                onChange={handleChangeLeave}
                placeholder="Reason"
                className="w-full mb-3 p-2 border border-gray-300 rounded-lg"
              />
              <input
                type="date"
                name="startDate"
                value={formLeave.startDate}
                onChange={handleChangeLeave}
                className="w-full mb-3 p-2 border border-gray-300 rounded-lg"
              />
              <input
                type="date"
                name="endDate"
                value={formLeave.endDate}
                onChange={handleChangeLeave}
                className="w-full mb-3 p-2 border border-gray-300 rounded-lg"
              />
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => handleCloseAddLeaveDialog()}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {openAdmin && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

            {adminData ? (
              <form>
                <div className="mb-4">
                  <label className="block text-lg font-medium" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={adminData.firstName}
                    onChange={(e) => setAdminData({ ...adminData, firstName: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-lg font-medium" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={adminData.lastName}
                    onChange={(e) => setAdminData({ ...adminData, lastName: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-lg font-medium" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={adminData.email}
                    onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-lg font-medium" htmlFor="birthDate">
                    Birth Date
                  </label>
                  <input
                    id="birthDate"
                    type="date"
                    value={adminData.birthDate}
                    onChange={(e) => setAdminData({ ...adminData, birthDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* <div className="mb-4">
                  <label className="block text-lg font-medium" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={adminData.password}
                    onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div> */}

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    className="mt-4 bg-red-500 text-white p-2 rounded-md"
                    onClick={() => setOpenAdmin(false)} 
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="mt-4 bg-blue-500 text-white p-2 rounded-md"
                    onClick={(e) => handleSaveProfile(e)}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <p>Loading profile...</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
