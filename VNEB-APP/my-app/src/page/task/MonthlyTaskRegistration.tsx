"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  Save,
  Send,
  Plus,
  Trash2,
  Loader2,
  PlusCircle,
  User,
  AlertTriangle,
  X,
} from "lucide-react";
import { useAppContext } from "../../app/context/AppProvider";
import { taskApi } from "../task/TaskApi";

interface TaskItem {
  id?: string;
  taskDescription: string;
  startDate: string;
  endDate: string;
  expectedOutcome: string;
  personalTarget: string;
  managerTarget: string;
  personalResult: string;
  managerResult: string;
  personalPriority: string;
  managerPriority: string;
  personalComplexity: string;
  managerComplexity: string;
  note: string;
}

interface TaskSection {
  id?: string;
  category: "A" | "B" | "C";
  sectionName: string;
  taskItems: TaskItem[];
}

interface MonthlyTaskRegistrationProps {
  targetUserId?: string;
  targetMonth?: string;
}

// --- Component Modal Xác Nhận ---
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "primary" | "danger" | "warning";
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  type = "primary",
}) => {
  if (!isOpen) return null;
  const styles =
    type === "danger"
      ? {
          bg: "bg-red-100",
          text: "text-red-600",
          btn: "bg-red-600 hover:bg-red-700",
        }
      : type === "warning"
        ? {
            bg: "bg-orange-100",
            text: "text-orange-600",
            btn: "bg-orange-600 hover:bg-orange-700",
          }
        : {
            bg: "bg-blue-100",
            text: "text-blue-600",
            btn: "bg-blue-600 hover:bg-blue-700",
          };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-500/75 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden transform animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${styles.bg}`}
            >
              <AlertTriangle className={styles.text} size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-500">{message}</p>
            </div>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex flex-row-reverse gap-3">
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm transition-all active:scale-95 ${styles.btn}`}
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-bold text-slate-700 border bg-white hover:bg-slate-50"
          >
            HỦY BỎ
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MonthlyTaskRegistration({
  targetUserId,
  targetMonth,
}: MonthlyTaskRegistrationProps) {
  const { user }: any = useAppContext();
  const activeUserId =
    targetUserId || user?.id || localStorage.getItem("userId");
  const activeMonth = targetMonth || "2026-03";
  const [targetUserRole, setTargetUserRole] = useState("");
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [taskSections, setTaskSections] = useState<TaskSection[]>([]);
  const [month, setMonth] = useState(activeMonth);
  const [status, setStatus] = useState("DRAFT");
  const [employeeName, setEmployeeName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState({
    show: false,
    msg: "",
    type: "success" as "success" | "error",
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "primary" as "primary" | "danger" | "warning",
    title: "",
    message: "",
    confirmText: "ĐỒNG Ý",
    cancelText: "HỦY BỎ",
    action: null as (() => void) | null,
  });

  const notify = (msg: string, type: "success" | "error" = "success") => {
    setShowToast({ show: true, msg, type });
    setTimeout(
      () => setShowToast({ show: false, msg: "", type: "success" }),
      3000,
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!activeUserId) return;
      setLoading(true);
      try {
        const res: any = await taskApi.getByUserAndMonth(activeUserId, month);
        if (res.data?.code === 200 && res.data.data) {
          const d = res.data.data;
          setRegistrationId(d.id);
          setTaskSections(Array.isArray(d.taskSections) ? d.taskSections : []);
          setStatus(d.status || "DRAFT");
          setTargetUserRole((d.user?.role || "STAFF").toUpperCase());
          setEmployeeName(d.user?.fullName || d.fullName || "");
        } else {
          setRegistrationId(null);
          setTaskSections([]);
          setStatus("DRAFT");
        }
      } catch (e) {
        setTaskSections([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month, activeUserId]);

  const { canEditGeneral, canEditResults, isApproverMode } = useMemo(() => {
    const myRole = (user?.role || "").toUpperCase();
    const targetRole = (targetUserRole || "").toUpperCase();
    const isOwner = String(user?.id) === String(activeUserId);

    let hasPermissionToEditQL = false;

    if (isOwner) {
      hasPermissionToEditQL = false;
    } else {
      if (myRole === "ADMIN" || myRole === "CHAIRMAN") {
        hasPermissionToEditQL = true;
      } else if (myRole === "BOD" && targetRole === "MANAGER") {
        hasPermissionToEditQL = true;
      } else if (myRole === "MANAGER" && targetRole === "STAFF") {
        hasPermissionToEditQL = true;
      }
    }

    return {
      canEditGeneral: isOwner || hasPermissionToEditQL,
      canEditResults: hasPermissionToEditQL,
      isApproverMode: !isOwner && hasPermissionToEditQL,
    };
  }, [user, activeUserId, targetUserRole]);

  const handleSave = async (newStatus?: string, silent = false) => {
    const payload = {
      id: registrationId,
      userId: activeUserId,
      month,
      status: newStatus || status,
      taskSections,
    };
    setLoading(true);
    try {
      const res: any = await taskApi.saveTasks(payload);
      if (res.data?.code === 200) {
        if (!silent) notify("Đã cập nhật dữ liệu!");
        if (newStatus) setStatus(newStatus);
        if (res.data.data?.id) setRegistrationId(res.data.data.id);
        return true;
      }
      return false;
    } catch (e) {
      notify("Lỗi kết nối", "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const executeApproveAction = async (action: "APPROVE" | "REJECT") => {
    setLoading(true);
    try {
      await handleSave(undefined, true);
      const res: any = await taskApi.approveTask(
        registrationId as string,
        action,
      );
      if (res.data.code === 200) {
        notify(
          action === "APPROVE" ? "Phê duyệt thành công!" : "Đã trả lại hồ sơ!",
        );
        setTimeout(() => window.location.reload(), 800);
      }
    } catch (e) {
      notify("Lỗi hệ thống", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateSection = (sIdx: number, field: string, value: any) => {
    const newSections = [...taskSections];
    (newSections[sIdx] as any)[field] = value;
    setTaskSections(newSections);
  };

  const updateTask = (
    sIdx: number,
    tIdx: number,
    field: string,
    value: any,
  ) => {
    const newSections = [...taskSections];

    const targetSection = { ...newSections[sIdx] };
    const newItems = [...targetSection.taskItems];

    let finalValue = value;
    const percentFields = [
      "personalTarget",
      "managerTarget",
      "personalResult",
      "managerResult",
    ];
    if (percentFields.includes(field)) {
      const numericValue = value.replace(/%/g, "").trim();
      if (numericValue !== "" && !isNaN(numericValue)) {
        finalValue = `${numericValue}%`;
      }
    }

    newItems[tIdx] = { ...newItems[tIdx], [field]: finalValue };
    targetSection.taskItems = newItems;
    newSections[sIdx] = targetSection;

    setTaskSections(newSections);
  };

  return (
    <div className="bg-white shadow-2xl rounded-xl border border-slate-200 overflow-hidden font-sans text-slate-900">
      {loading && (
        <div className="fixed inset-0 bg-white/40 z-[110] flex items-center justify-center backdrop-blur-[2px]">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      )}
      {showToast.show && (
        <div
          className={`fixed top-5 right-5 z-[120] flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold shadow-2xl animate-in slide-in-from-right-10 ${showToast.type === "success" ? "bg-green-600" : "bg-red-600"}`}
        >
          {showToast.msg}
        </div>
      )}

      {/* FIXED TS2783: Bỏ isOpen={confirmModal.isOpen} vì nó đã có trong {...confirmModal} */}
      <ConfirmModal
        {...confirmModal}
        onConfirm={() => {
          confirmModal.action?.();
          setConfirmModal((p) => ({ ...p, isOpen: false }));
        }}
        onCancel={() => setConfirmModal((p) => ({ ...p, isOpen: false }))}
      />

      <div className="bg-slate-50 border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
            <User size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              Hồ sơ của:
            </p>
            <p className="text-sm font-black text-blue-900 uppercase">
              {employeeName || "..."}
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full border ${status === "APPROVED" ? "bg-green-100 text-green-700 border-green-200" : "bg-orange-100 text-orange-700 border-orange-200"}`}
        >
          {status}
        </span>
      </div>

      <div className="p-4 bg-white border-b flex justify-between items-center">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border-2 border-slate-100 p-2 rounded-lg font-bold text-blue-700 outline-none"
        />
        <div className="flex gap-2">
          {canEditGeneral && (
            <button
              onClick={() => handleSave()}
              className="bg-white border px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-50"
            >
              <Save size={16} /> {status === "APPROVED" ? "CẬP NHẬT" : "LƯU"}
            </button>
          )}
          {status !== "APPROVED" && !isApproverMode && (
            <button
              onClick={() =>
                setConfirmModal((p) => ({
                  ...p,
                  isOpen: true,
                  type: "primary",
                  title: "Gửi phê duyệt",
                  message: "Bạn muốn gửi hồ sơ này?",
                  action: () => handleSave("PENDING_MANAGER"),
                }))
              }
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-lg flex items-center gap-2"
            >
              <Send size={16} /> GỬI TRÌNH DUYỆT
            </button>
          )}
          {isApproverMode && status !== "APPROVED" && (
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setConfirmModal((p) => ({
                    ...p,
                    isOpen: true,
                    type: "danger",
                    title: "Trả lại",
                    message: "Yêu cầu sửa lại?",
                    action: () => executeApproveAction("REJECT"),
                  }))
                }
                className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-lg text-xs font-bold"
              >
                TRẢ LẠI
              </button>
              <button
                onClick={() =>
                  setConfirmModal((p) => ({
                    ...p,
                    isOpen: true,
                    type: "primary",
                    title: "Phê duyệt",
                    message: "Xác nhận nội dung này?",
                    action: () => executeApproveAction("APPROVE"),
                  }))
                }
                className="bg-green-600 text-white px-6 py-2 rounded-lg text-xs font-bold"
              >
                PHÊ DUYỆT
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 overflow-x-auto max-h-[calc(100vh-250px)] sticky bottom-0">
        <table className="w-[1800px] border-collapse text-[11px] border border-slate-200">
          <thead>
            <tr className="bg-[#2F5597] text-white uppercase">
              <th rowSpan={2} className="border p-3 w-12">
                STT
              </th>
              <th rowSpan={2} className="border p-3 w-56">
                Hạng mục
              </th>
              <th rowSpan={2} className="border p-3 w-80">
                Nhiệm vụ
              </th>
              <th rowSpan={2} className="border p-3 w-80 bg-[#3a5ba0]">Kết quả cần đạt</th>
              <th colSpan={2} className="border p-2">
                Thời gian
              </th>
              <th colSpan={2} className="border p-2">
                Mục tiêu
              </th>
              <th colSpan={2} className="border p-2">
                Kết quả
              </th>
              <th colSpan={2} className="border p-2 bg-[#1F3864]">
                Ưu tiên
              </th>
              <th colSpan={2} className="border p-2 bg-[#375623]">
                Phức tạp
              </th>
              <th className="border p-2 bg-[orange]">Ghi chú / Lưu ý</th>
              <th rowSpan={2} className="p-3 w-12 text-center">
                #
              </th>
            </tr>
            <tr className="bg-[#D9E1F2] text-slate-700 font-bold uppercase border-b border-slate-300">
              <th className="border p-2">Bắt đầu</th>
              <th className="border p-2">Kết thúc</th>
              <th className="border p-2 text-blue-700">CN</th>
              <th className="border p-2 text-orange-700 bg-orange-50">QL</th>
              <th className="border p-2 text-blue-700">CN</th>
              <th className="border p-2 text-orange-700 bg-orange-50">QL</th>
              <th className="border p-2 text-blue-700">CN</th>
              <th className="border p-2 text-orange-700 bg-orange-50">QL</th>
              <th className="border p-2 text-blue-700">CN</th>
              <th className="border p-2 text-orange-700 bg-orange-50">QL</th>
            </tr>
          </thead>
          <tbody>
            {["A", "B", "C"].map((cat) => (
              <React.Fragment key={cat}>
                <tr className="bg-slate-100 font-black text-[#1F3864] border-y border-slate-300">
                  <td colSpan={16} className="p-3 uppercase italic">
                    Phần {cat}.{" "}
                    {cat === "A"
                      ? "Nhiệm vụ trọng tâm"
                      : cat === "B"
                        ? "Nhiệm vụ bổ sung"
                        : "Nhiệm vụ phát sinh"}
                  </td>
                </tr>
                {taskSections
                  .filter((s) => s.category === cat)
                  .map((section, sIdx) => {
                    const gIdx = taskSections.findIndex((x) => x === section);
                    return section.taskItems.map((task, tIdx) => (
                      <tr
                        key={`${gIdx}-${tIdx}`}
                        className="hover:bg-blue-50/50 transition-colors border-b border-slate-100"
                      >
                        {tIdx === 0 && (
                          <>
                            <td
                              rowSpan={section.taskItems.length}
                              className="border text-center font-bold text-slate-400 bg-white"
                            >
                              {sIdx + 1}
                            </td>
                            <td
                              rowSpan={section.taskItems.length}
                              className="border p-3 bg-white align-top"
                            >
                              <textarea
                                className="w-full font-bold text-red-600 outline-none bg-transparent resize-none"
                                value={section.sectionName}
                                disabled={!canEditGeneral}
                                onChange={(e) =>
                                  updateSection(
                                    gIdx,
                                    "sectionName",
                                    e.target.value,
                                  )
                                }
                              />
                              {canEditGeneral && (
                                <button
                                  onClick={() => {
                                    const ns = [...taskSections];
                                    ns[gIdx].taskItems.push({
                                      taskDescription: "",
                                      expectedOutcome: "",
                                      startDate: "",
                                      endDate: "",
                                      personalTarget: "100%",
                                      managerTarget: "",
                                      personalResult: "",
                                      managerResult: "",
                                      personalPriority: "Medium",
                                      managerPriority: "Medium",
                                      personalComplexity: "Normal",
                                      managerComplexity: "Normal",
                                      note: "",
                                    });
                                    setTaskSections(ns);
                                  }}
                                  className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-2"
                                >
                                  <PlusCircle size={14} /> Thêm việc
                                </button>
                              )}
                            </td>
                          </>
                        )}
                        <td className="border p-1">
                          <textarea
                            className="w-full outline-none bg-transparent resize-none"
                            rows={2}
                            value={task.taskDescription}
                            disabled={!canEditGeneral}
                            onChange={(e) =>
                              updateTask(
                                gIdx,
                                tIdx,
                                "taskDescription",
                                e.target.value,
                              )
                            }
                          />
                        </td>
                        <td className="border p-1 bg-blue-50/30">
  <textarea
    className="w-full outline-none bg-transparent resize-none italic text-blue-800"
    rows={2}
    placeholder="Ví dụ: Đối tác đánh giá khả thi..."
    value={task.expectedOutcome || ""}
    disabled={!canEditGeneral}
    onChange={(e) => updateTask(gIdx, tIdx, "expectedOutcome", e.target.value)}
  />
</td>
                        <td className="border p-1 text-center">
                          <input
                            type="date"
                            className="w-full bg-transparent text-center outline-none"
                            value={task.startDate}
                            disabled={!canEditGeneral}
                            onChange={(e) =>
                              updateTask(
                                gIdx,
                                tIdx,
                                "startDate",
                                e.target.value,
                              )
                            }
                          />
                        </td>
                        <td className="border p-1 text-center">
                          <input
                            type="date"
                            className="w-full bg-transparent text-center outline-none"
                            value={task.endDate}
                            disabled={!canEditGeneral}
                            onChange={(e) =>
                              updateTask(gIdx, tIdx, "endDate", e.target.value)
                            }
                          />
                        </td>
                        <td className="border p-1">
                          <input
                            className="w-full text-center bg-transparent outline-none"
                            value={task.personalTarget}
                            disabled={!canEditGeneral}
                            onChange={(e) =>
                              updateTask(
                                gIdx,
                                tIdx,
                                "personalTarget",
                                e.target.value,
                              )
                            }
                          />
                        </td>
                        <td className="border p-1 bg-orange-50/30">
                          <input
                            className="w-full text-center bg-transparent font-bold text-orange-700 outline-none"
                            value={task.managerTarget}
                            disabled={!canEditResults}
                            onChange={(e) =>
                              updateTask(
                                gIdx,
                                tIdx,
                                "managerTarget",
                                e.target.value,
                              )
                            }
                          />
                        </td>
                        <td className="border p-1">
                          <input
                            className="w-full text-center bg-transparent outline-none"
                            value={task.personalResult}
                            disabled={!canEditGeneral}
                            onChange={(e) =>
                              updateTask(
                                gIdx,
                                tIdx,
                                "personalResult",
                                e.target.value,
                              )
                            }
                          />
                        </td>
                        <td className="border p-1 bg-orange-50/30">
                          <input
                            className="w-full text-center bg-transparent font-bold text-orange-700 outline-none"
                            value={task.managerResult}
                            disabled={!canEditResults}
                            onChange={(e) =>
                              updateTask(
                                gIdx,
                                tIdx,
                                "managerResult",
                                e.target.value,
                              )
                            }
                          />
                        </td>
                        <td className="border p-1">
                          <select
                            className="w-full bg-transparent outline-none"
                            value={task.personalPriority}
                            disabled={!canEditGeneral}
                            onChange={(e) =>
                              updateTask(
                                gIdx,
                                tIdx,
                                "personalPriority",
                                e.target.value,
                              )
                            }
                          >
                            <option value="High">Cao</option>
                            <option value="Medium">T.Bình</option>
                            <option value="Low">Thấp</option>
                          </select>
                        </td>
                        <td className="border p-1 bg-orange-50/30 text-orange-700 font-bold">
                          <select
                            className="w-full bg-transparent outline-none"
                            value={task.managerPriority}
                            disabled={!canEditResults}
                            onChange={(e) =>
                              updateTask(
                                gIdx,
                                tIdx,
                                "managerPriority",
                                e.target.value,
                              )
                            }
                          >
                            <option value="High">Cao</option>
                            <option value="Medium">T.Bình</option>
                            <option value="Low">Thấp</option>
                          </select>
                        </td>
                        <td className="border p-1">
                          <select
                            className="w-full bg-transparent outline-none"
                            value={task.personalComplexity}
                            disabled={!canEditGeneral}
                            onChange={(e) =>
                              updateTask(
                                gIdx,
                                tIdx,
                                "personalComplexity",
                                e.target.value,
                              )
                            }
                          >
                            <option value="Complex">P.Tạp</option>
                            <option value="Normal">B.Thường</option>
                            <option value="Simple">D.Giản</option>
                          </select>
                        </td>
                        <td className="border p-1 bg-orange-50/30 text-orange-700 font-bold">
                          <select
                            className="w-full bg-transparent outline-none"
                            value={task.managerComplexity}
                            disabled={!canEditResults}
                            onChange={(e) =>
                              updateTask(
                                gIdx,
                                tIdx,
                                "managerComplexity",
                                e.target.value,
                              )
                            }
                          >
                            <option value="Complex">P.Tạp</option>
                            <option value="Normal">B.Thường</option>
                            <option value="Simple">D.Giản</option>
                          </select>
                        </td>
                        <td className="border p-1 bg-orange-50/30 text-orange-700 font-bold">
                          <textarea
                            value={task.note || ""}
                            onChange={(e) =>
                              updateTask(gIdx, tIdx, "note", e.target.value)
                            }
                            className="w-full bg-transparent outline-none text-[11px] text-slate-500 italic resize-none"
                            placeholder="Ghi chú nhiệm vụ..."
                            rows={2}
                          />
                        </td>
                        <td className="text-center border p-1">
                          {status === "APPROVED"
                            ? (user?.role || "").toUpperCase() ===
                                "CHAIRMAN" && (
                                <button
                                  onClick={() => {
                                    const ns = [...taskSections];
                                    ns[gIdx].taskItems.splice(tIdx, 1);
                                    if (ns[gIdx].taskItems.length === 0)
                                      ns.splice(gIdx, 1);
                                    setTaskSections(ns);
                                  }}
                                  className="text-red-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )
                            : canEditGeneral && (
                                <button
                                  onClick={() => {
                                    const ns = [...taskSections];
                                    ns[gIdx].taskItems.splice(tIdx, 1);
                                    if (ns[gIdx].taskItems.length === 0)
                                      ns.splice(gIdx, 1);
                                    setTaskSections(ns);
                                  }}
                                  className="text-slate-300 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                        </td>
                      </tr>
                    ));
                  })}
                {canEditGeneral && (
                  <tr>
                    <td colSpan={16} className="p-3 border-b bg-white">
                      <button
                        onClick={() =>
                          setTaskSections([
                            ...taskSections,
                            {
                              category: cat as any,
                              sectionName: "",
                              taskItems: [
                                {
                                  taskDescription: "",
                                  startDate: "",
                                  endDate: "",
                                  expectedOutcome: "",
                                  personalTarget: "100%",
                                  managerTarget: "",
                                  personalResult: "",
                                  managerResult: "",
                                  personalPriority: "Medium",
                                  managerPriority: "Medium",
                                  personalComplexity: "Normal",
                                  managerComplexity: "Normal",
                                  note: "",
                                },
                              ],
                            },
                          ])
                        }
                        className="text-blue-600 font-bold flex items-center gap-2 text-xs uppercase"
                      >
                        <Plus size={18} /> Thêm hạng mục {cat}
                      </button>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            <tr className="bg-slate-900 text-white font-bold text-sm shadow-inner">
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
