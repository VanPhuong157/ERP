import React, { useState, useEffect } from 'react';
import { leaveApi } from './LeaveApi';
import { FileSpreadsheet, Save } from 'lucide-react';

export default function LeaveQuotaTable({ user }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await leaveApi.getQuotaReport(user?.company);
      setData(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <table className="w-full text-[11px] font-bold">
        <thead className="bg-slate-900 text-white uppercase">
          <tr>
            <th className="p-4 text-left">Nhân viên / Phòng ban</th>
            <th className="p-4 text-center bg-slate-800">Phép tồn</th>
            <th className="p-4 text-center bg-slate-800">Phép mới</th>
            <th className="p-4 text-center text-blue-400">Tổng cộng</th>
            <th className="p-4 text-center text-green-400">Đã nghỉ</th>
            <th className="p-4 text-center text-orange-400">Sớm/Muộn</th>
            <th className="p-4 text-center text-red-400">Không lương</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx} className="border-b hover:bg-slate-50 transition">
              <td className="p-4">
                <div className="font-black text-slate-900">{item.fullName}</div>
                <div className="text-[9px] text-slate-500 uppercase">{item.departmentName}</div>
              </td>
              <td className="p-4 text-center text-slate-600">{item.remainingLastYear}</td>
              <td className="p-4 text-center text-slate-600">{item.newQuota}</td>
              <td className="p-4 text-center bg-blue-50 text-blue-700">{item.totalQuota}</td>
              <td className="p-4 text-center text-green-700">{item.usedPaidLeave}</td>
              <td className="p-4 text-center text-orange-700">{item.lateEarlyCount}</td>
              <td className="p-4 text-center text-red-700">{item.unpaidLeave}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}