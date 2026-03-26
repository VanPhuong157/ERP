import React, { useEffect, useState, ChangeEvent } from "react";
import {
  User,
  Edit,
  FileText,
  Phone,
  Mail,
  Briefcase,
  CreditCard,
  ShieldCheck,
  Search,
  X,
  Building2,
  Calendar,
  MapPin,
  Fingerprint,
  GraduationCap,
  Clock,
  Landmark,
  Wallet,
  DollarSign,
  Receipt,
  Paperclip,
  Download,
} from "lucide-react";
import { authenApi } from "../authen/authenApi";
import Swal from "sweetalert2";

// 1. ĐƯA INPUTFIELD RA NGOÀI ĐỂ TRÁNH MẤT FOCUS
const InputField = ({
  label,
  name,
  type = "text",
  icon: Icon,
  value,
  onChange,
}: any) => {
  const formatDate = (dateStr: string) =>
    dateStr ? dateStr.split("T")[0] : "";

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1">
        {Icon && <Icon size={10} />} {label}
      </label>
      <input
        type={type}
        name={name}
        value={type === "date" ? formatDate(value) : value || ""}
        onChange={onChange}
        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold text-slate-700 transition-all"
      />
    </div>
  );
};

const EmployeeManagerPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("personal");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await authenApi.getAllUsers();
      if (res.data.code === 200) setUsers(res.data.data);
    } catch (err) {
      console.error("Lỗi fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = async (id: string) => {
    try {
      const res = await authenApi.getById(id);
      if (res.data.code === 200) {
        setEditingUser(res.data.data);
        setIsModalOpen(true);
      }
    } catch (err) {
      Swal.fire("Lỗi", "Không thể lấy thông tin", "error");
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditingUser((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    if (!filePath) {
      Swal.fire("Thông báo", "Hồ sơ này chưa có file đính kèm.", "info");
      return;
    }

    try {
      const response = await authenApi.downloadContract(filePath);

      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const finalFileName = fileName || filePath.split("/").pop() || "document";

      link.setAttribute("download", finalFileName);
      document.body.appendChild(link);
      link.click();

      // Dọn dẹp
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      Swal.fire(
        "Lỗi",
        "Không thể tải file. Hãy kiểm tra responseType trong API call.",
        "error",
      );
    }
  };

  const handleFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    type: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingUser?.id) return;

    try {
      Swal.fire({
        title: "Đang tải lên...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await authenApi.uploadContract(file, editingUser.id, type);

      if (res.data.code === 200) {
        const newPath = res.data.data;

        setEditingUser((prev: any) => ({
          ...prev,
          [`officialContractFile${type}`]: newPath,
        }));

        Swal.fire("Thành công", `Đã cập nhật file hợp đồng ${type}`, "success");
      }
    } catch (err) {
      Swal.fire("Lỗi", "Tải lên thất bại", "error");
    }
  };

  const handleSave = async () => {
    try {
      const res = await authenApi.updateInfo(editingUser);
      if (res.data.code === 200) {
        Swal.fire("Thành công", "Hồ sơ đã được lưu", "success");
        setIsModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      Swal.fire("Lỗi", "Cập nhật thất bại", "error");
    }
  };

  const filteredUsers = users.filter(
    (u: any) =>
      u.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div className="p-4 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 uppercase italic">
            <div className="p-2 bg-blue-600 text-white rounded-xl">
              <User size={24} />
            </div>
            Hồ sơ nhân sự toàn hệ thống
          </h2>
          <p className="text-slate-400 text-xs font-bold mt-1 tracking-widest uppercase">
            Quản lý tập trung dữ liệu VNEB - VHS
          </p>
        </div>
        <div className="relative group">
          <Search
            className="absolute left-4 top-3 text-slate-400 group-focus-within:text-blue-600 transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc tài khoản..."
            className="pl-12 pr-6 py-3 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 w-80 text-sm font-medium transition-all shadow-inner bg-slate-50"
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800 text-white font-bold uppercase text-[10px] tracking-[0.2em]">
            <tr>
              <th className="px-8 py-5">Nhân viên</th>
              <th className="px-8 py-5">Tài khoản (Email)</th>
              <th className="px-8 py-5">Phòng ban</th>
              <th className="px-8 py-5">Chức vụ</th>
              <th className="px-8 py-5 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-blue-50/50 transition-all group cursor-default"
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center font-black group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      {user.fullName?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-slate-700 uppercase italic text-sm">
                        {user.fullName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                        ID: {user.id.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 font-bold text-slate-500 text-sm">
                  {user.username}
                </td>
                <td className="px-8 py-5 font-bold text-blue-600 text-xs uppercase italic">
                  {user.departmentName || user.department?.name || "Chưa gán"}
                </td>
                <td className="px-8 py-5 text-slate-500 font-medium italic">
                  {user.position || "Nhân viên"}
                </td>
                <td className="px-8 py-5 text-center">
                  <button
                    onClick={() => handleEdit(user.id)}
                    className="bg-slate-100 text-slate-600 p-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    <Edit size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-200">
                  {editingUser?.fullName?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-wider">
                    {editingUser?.fullName}
                  </h3>
                  <div className="flex gap-4 mt-1">
                    <span className="text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-lg uppercase">
                      {editingUser?.role}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Mã NV: {editingUser?.id}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-12 h-12 flex items-center justify-center hover:bg-red-50 hover:text-red-500 rounded-2xl text-slate-300 transition-all active:scale-90"
              >
                <X size={32} />
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex bg-slate-50/50 px-10 border-b border-slate-100 overflow-x-auto no-scrollbar">
              {[
                { id: "personal", label: "Thông tin cá nhân", icon: User },
                { id: "work", label: "Công tác & Chức vụ", icon: Briefcase },
                {
                  id: "contract",
                  label: "Hợp đồng & Pháp lý",
                  icon: ShieldCheck,
                },
                {
                  id: "finance",
                  label: "Tài chính & Bảo hiểm",
                  icon: CreditCard,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-5 flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all border-b-4 whitespace-nowrap ${activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-10 bg-white custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {activeTab === "personal" && (
                  <>
                    <div className="col-span-2">
                      <InputField
                        label="Họ tên đầy đủ"
                        name="fullName"
                        icon={User}
                        value={editingUser?.fullName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-span-2">
                      <InputField
                        label="Email cá nhân"
                        name="email"
                        icon={Mail}
                        value={editingUser?.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                        Giới tính
                      </label>
                      <select
                        name="gender"
                        value={editingUser?.gender || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option value="">Chọn...</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                    </div>
                    <InputField
                      label="Ngày sinh"
                      name="birthday"
                      type="date"
                      icon={Calendar}
                      value={editingUser?.birthday}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Dân tộc"
                      name="ethnic"
                      value={editingUser?.ethnic}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Số điện thoại"
                      name="phoneNumber"
                      icon={Phone}
                      value={editingUser?.phoneNumber}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Số CCCD"
                      name="idCardNumber"
                      icon={Fingerprint}
                      value={editingUser?.idCardNumber}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Ngày cấp"
                      name="idCardIssuedDate"
                      type="date"
                      value={editingUser?.idCardIssuedDate}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Nơi cấp"
                      name="idCardIssuedPlace"
                      value={editingUser?.idCardIssuedPlace}
                      onChange={handleInputChange}
                    />
                    <div className="col-span-4">
                      <InputField
                        label="Địa chỉ thường trú"
                        name="permanentAddress"
                        icon={MapPin}
                        value={editingUser?.permanentAddress}
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                )}

                {activeTab === "work" && (
                  <>
                    <InputField
                      label="Pháp nhân ký HĐ"
                      name="company"
                      icon={Building2}
                      value={editingUser?.company}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Chức danh/Chức vụ"
                      name="position"
                      icon={Briefcase}
                      value={editingUser?.position}
                      onChange={handleInputChange}
                    />
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                        Bộ phận/Phòng ban
                      </label>
                      <input
                        value={
                          editingUser?.department?.name ||
                          editingUser?.departmentName ||
                          "N/A"
                        }
                        readOnly
                        className="w-full px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl text-sm font-bold outline-none cursor-not-allowed"
                      />
                    </div>
                    <InputField
                      label="Trình độ học vấn"
                      name="educationLevel"
                      icon={GraduationCap}
                      value={editingUser?.educationLevel}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Trường đào tạo"
                      name="school"
                      value={editingUser?.school}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Chuyên ngành"
                      name="major"
                      value={editingUser?.major}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Ngày vào làm"
                      name="joinDate"
                      type="date"
                      icon={Clock}
                      value={editingUser?.joinDate}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Ngày bắt đầu thử việc"
                      name="probationStartDate"
                      type="date"
                      value={editingUser?.probationStartDate}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Ngày kết thúc thử việc"
                      name="probationEndDate"
                      type="date"
                      value={editingUser?.probationEndDate}
                      onChange={handleInputChange}
                    />
                  </>
                )}

                {activeTab === "contract" && (
                  <>
                    <div className="col-span-2">
                      <InputField
                        label="Loại hợp đồng lao động"
                        name="contractType"
                        icon={FileText}
                        value={editingUser?.contractType}
                        onChange={handleInputChange}
                      />
                    </div>
                    <InputField
                      label="Mã số thuế"
                      name="taxCode"
                      icon={Receipt}
                      value={editingUser?.taxCode}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Mã số BHXH"
                      name="insuranceCode"
                      icon={ShieldCheck}
                      value={editingUser?.insuranceCode}
                      onChange={handleInputChange}
                    />

                    <div className="col-span-4 grid grid-cols-3 gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                      <div className="col-span-3 text-[11px] font-black uppercase text-blue-600 mb-2 tracking-widest">
                        Quản lý mốc ký kết Hợp đồng chính thức
                      </div>
                      <InputField
                        label="Ngày ký HĐ lần 1"
                        name="officialContractDate1"
                        type="date"
                        value={editingUser?.officialContractDate1}
                        onChange={handleInputChange}
                      />
                      <InputField
                        label="Ngày ký HĐ lần 2"
                        name="officialContractDate2"
                        type="date"
                        value={editingUser?.officialContractDate2}
                        onChange={handleInputChange}
                      />
                      <InputField
                        label="Ngày ký HĐ lần 3"
                        name="officialContractDate3"
                        type="date"
                        value={editingUser?.officialContractDate3}
                        onChange={handleInputChange}
                      />

                      <div className="col-span-3 grid grid-cols-3 gap-4 mt-4">
                        {["1", "2", "3"].map((num) => (
                          <div key={num} className="flex flex-col gap-2">
                            <button
                              disabled={
                                !editingUser?.[`officialContractFile${num}`]
                              }
                              onClick={() => {
                                const path =
                                  editingUser?.[`officialContractFile${num}`];
                                handleDownload(path, "");
                              }}
                              className="w-full py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase hover:border-blue-500 hover:text-blue-600 transition-all disabled:opacity-30 active:scale-95 shadow-sm flex items-center justify-center gap-2"
                            >
                              <Download size={14} /> Tải File HĐ {num}
                            </button>

                            <label className="w-full py-2 bg-blue-50 border border-blue-200 rounded-xl text-[9px] font-black text-blue-600 uppercase text-center cursor-pointer hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-1 shadow-sm">
                              <Paperclip size={12} /> Tải lên mới
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, num)}
                              />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "finance" && (
                  <>
                    <InputField
                      label="Mức lương thử việc"
                      name="probationSalary"
                      type="number"
                      icon={DollarSign}
                      value={editingUser?.probationSalary}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Mức lương chính thức"
                      name="officialSalary"
                      type="number"
                      icon={DollarSign}
                      value={editingUser?.officialSalary}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Lương đóng BHXH (BĐ)"
                      name="insuranceSalaryStart"
                      type="number"
                      icon={Wallet}
                      value={editingUser?.insuranceSalaryStart}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Lương đóng BHXH (HT)"
                      name="insuranceSalaryCurrent"
                      type="number"
                      value={editingUser?.insuranceSalaryCurrent}
                      onChange={handleInputChange}
                    />

                    <div className="col-span-4 border-b border-slate-100 my-4 italic text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em] text-center">
                      Thông tin giải ngân
                    </div>

                    <div className="col-span-2">
                      <InputField
                        label="Tên ngân hàng"
                        name="bankName"
                        icon={Landmark}
                        value={editingUser?.bankName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-span-2">
                      <InputField
                        label="Số tài khoản ngân hàng"
                        name="bankAccountNumber"
                        icon={CreditCard}
                        value={editingUser?.bankAccountNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-10 py-8 border-t border-slate-100 flex justify-end gap-4 bg-white sticky bottom-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all text-xs uppercase tracking-[0.2em]"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSave}
                className="px-12 py-3 rounded-2xl font-black bg-blue-600 text-white hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all text-xs uppercase italic tracking-[0.1em] active:scale-95"
              >
                Lưu hồ sơ nhân sự
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagerPage;
