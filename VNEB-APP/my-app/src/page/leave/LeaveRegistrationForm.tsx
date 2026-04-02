"use client";
import React, { useState, useEffect } from "react";
import { 
  Save, Send, Clock, Calendar, FileText, AlertCircle,
  CheckCircle2, Trash2, ShieldCheck, UserCheck, ArrowRight,Plus
} from "lucide-react";
import { leaveApi } from "./LeaveApi";
import SuccessModal from "../../component/SuccessModal";

export default function LeaveRegistrationForm({ user, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const isApprover = ["BOD", "CHAIRMAN", "MANAGER"].includes(user?.role?.toUpperCase());
  const isHCNSDept = user?.departmentName?.toUpperCase().includes("HCNS") || 
                     user?.departmentName?.toUpperCase().includes("HÀNH CHÍNH");

  // Cập nhật State: Thay requestDate bằng requestDate (Từ ngày) và endDate (Đến ngày)
  const [formData, setFormData] = useState({
    confirmationType: "Nghỉ phép",
    requestDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    fromTime: "08:00",
    toTime: "17:30",
    reason: ""
  });

  const loadHistory = async () => {
    try {
      const res: any = await leaveApi.getByUser();
      if (res.data?.code === 200) setMyRequests(res.data.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (user?.id) loadHistory(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason) return alert("Vui lòng nhập lý do");
    
    // Kiểm tra logic ngày
    if (new Date(formData.requestDate) > new Date(formData.endDate)) {
      return alert("Ngày bắt đầu không được lớn hơn ngày kết thúc");
    }

    setLoading(true);
    try {
      const payload = { ...formData, userId: user.id, status: 0 };
      const res: any = await leaveApi.create(payload);
      
      if (res.data.code === 200) {
        setModalMessage("Đơn đăng ký của bạn đã được gửi thành công đến quản lý.");
        setIsSuccessModalOpen(true);
        setFormData({ ...formData, reason: "" });
        loadHistory();
        if (onSuccess) onSuccess();
      }
    } catch (e) {
      alert("Lỗi khi gửi đơn");
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn muốn hủy đơn này?")) return;
    await leaveApi.delete(id);
    loadHistory();
  };

  return (
    <div className="space-y-6">
      <SuccessModal 
        isOpen={isSuccessModalOpen} 
        onClose={() => setIsSuccessModalOpen(false)}
        message={modalMessage}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-[#1F3864] text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
              <PlusCircle size={16} /> Tạo Đăng Ký Mới
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Loại xác nhận */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Loại xác nhận (*)</label>
                <select 
                  value={formData.confirmationType}
                  onChange={(e) => setFormData({...formData, confirmationType: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Nghỉ phép">Nghỉ phép</option>
                  <option value="Nghỉ bù">Nghỉ bù</option>
                  <option value="Nghỉ không lương">Nghỉ không lương</option>
                  <option value="Nghỉ chế độ">Nghỉ chế độ</option>
                  <option value="Đi muộn/Về sớm">Đi muộn/Về sớm</option>
                </select>
              </div>

              {/* Chọn Ngày - Tách thành Từ ngày / Đến ngày */}
              <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">
                      {formData.confirmationType === "Đi muộn/Về sớm" ? "Ngày thực hiện" : "Từ ngày"}
                    </label>
                    <input 
                      type="date"
                      value={formData.requestDate}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setFormData({...formData, requestDate: newDate, endDate: formData.confirmationType === "Đi muộn/Về sớm" ? newDate : formData.endDate});
                      }}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold shadow-sm"
                    />
                  </div>

                  {formData.confirmationType !== "Đi muộn/Về sớm" && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Đến ngày</label>
                      <input 
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Giờ giấc */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Từ giờ</label>
                  <input 
                    type="time"
                    value={formData.fromTime}
                    onChange={(e) => setFormData({...formData, fromTime: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Đến giờ</label>
                  <input 
                    type="time"
                    value={formData.toTime}
                    onChange={(e) => setFormData({...formData, toTime: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Lý do chi tiết</label>
                <textarea 
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="Nhập lý do cụ thể..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-blue-500"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#1F3864] text-white py-3 rounded-lg font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-800 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-900/20"
              >
                {loading ? "Đang gửi..." : <><Send size={16} /> Gửi Đơn Đăng Ký</>}
              </button>
            </form>
          </div>
        </div>

        {/* Lịch sử bên phải */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                <Clock size={16} /> Lịch sử đăng ký
              </h3>
            </div>
            
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {myRequests.length === 0 && (
                <div className="p-10 text-center text-slate-400 text-xs italic">Bạn chưa có đơn đăng ký nào.</div>
              )}
              {myRequests.map((req) => (
                <div key={req.id} className="p-4 hover:bg-slate-50 transition flex justify-between items-center border-l-4 border-transparent hover:border-blue-500">
                  <div className="flex gap-4 items-start">
                    <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-black text-[#1F3864] uppercase">{req.confirmationType}</div>
                      <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-0.5">
                        <span className="text-blue-600">{formatDate(req.requestDate)}</span>
                        {req.endDate && req.endDate !== req.requestDate && (
                          <>
                            <ArrowRight size={10} />
                            <span className="text-blue-600">{formatDate(req.endDate)}</span>
                          </>
                        )}
                        <span className="mx-1">|</span>
                        <span className="text-slate-700">{req.fromTime} - {req.toTime}</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-2 p-2 bg-slate-50 rounded border border-slate-100 italic">
                        "{req.reason}"
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {req.status === 1 ? (
                      <span className="flex items-center gap-1 text-[9px] font-black text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 uppercase shadow-sm">
                        <CheckCircle2 size={12}/> Đã duyệt
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                         <span className="flex items-center gap-1 text-[9px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 uppercase">
                          <AlertCircle size={12}/> Chờ duyệt
                        </span>
                        <button onClick={() => handleDelete(req.id)} className="text-red-400 hover:text-red-600 transition p-1 hover:bg-red-50 rounded">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlusCircle({ size }: { size: number }) {
  return <Plus size={size} />;
}