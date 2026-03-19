'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, FileSpreadsheet, Zap, Save, Calculator, TrendingUp, TrendingDown } from 'lucide-react';

interface ElectricityUsage {
  id: string;
  maKhachHang: string;
  tinh: string;
  kcnCcn: string;
  tenKhachHang: string;
  nam: number;
  thang: number;
  capDienAp: string;
  gia_KhongTheoTG: number;
  gia_BinhThuong: number;
  gia_CaoDiem: number;
  gia_ThapDiem: number;
  p_KhongTheoTG: number;
  p_BinhThuong: number;
  p_CaoDiem: number;
  p_ThapDiem: number;
  tongDienNang: number;
  tien_KhongTheoTG: number;
  tien_BinhThuong: number;
  tien_CaoDiem: number;
  tien_ThapDiem: number;
  tongThanhTien: number;
}

export default function ElectricityUsagePage() {
  const [data, setData] = useState<ElectricityUsage[]>([
    {
      id: '0',
      maKhachHang: 'EM2410223393',
      tinh: 'Hải Phòng',
      kcnCcn: 'Đình Vũ',
      tenKhachHang: 'CÔNG TY CỔ PHẦN THIẾT BỊ ĐIỆN NANO',
      nam: 2025,
      thang: 12,
      capDienAp: '22',
      gia_KhongTheoTG: 0, gia_BinhThuong: 1538, gia_CaoDiem: 2871, gia_ThapDiem: 1007,
      p_KhongTheoTG: 0, p_BinhThuong: 40000, p_CaoDiem: 10000, p_ThapDiem: 5000,
      tongDienNang: 55000,
      tien_KhongTheoTG: 0, tien_BinhThuong: 61520000, tien_CaoDiem: 28710000, tien_ThapDiem: 5035000,
      tongThanhTien: 95265000,
    },
    {
      id: '1',
      maKhachHang: 'EM2410223393',
      tinh: 'Hải Phòng',
      kcnCcn: 'Đình Vũ',
      tenKhachHang: 'CÔNG TY CỔ PHẦN THIẾT BỊ ĐIỆN NANO',
      nam: 2026,
      thang: 1,
      capDienAp: '22',
      gia_KhongTheoTG: 0, gia_BinhThuong: 1538, gia_CaoDiem: 2871, gia_ThapDiem: 1007,
      p_KhongTheoTG: 0, p_BinhThuong: 45200, p_CaoDiem: 12500, p_ThapDiem: 8900,
      tongDienNang: 66600,
      tien_KhongTheoTG: 0, tien_BinhThuong: 69517600, tien_CaoDiem: 35887500, tien_ThapDiem: 8962300,
      tongThanhTien: 114367400,
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ElectricityUsage>({
    id: '', maKhachHang: '', tinh: '', kcnCcn: '', tenKhachHang: '', nam: 2026, thang: 1, capDienAp: '',
    gia_KhongTheoTG: 0, gia_BinhThuong: 0, gia_CaoDiem: 0, gia_ThapDiem: 0,
    p_KhongTheoTG: 0, p_BinhThuong: 0, p_CaoDiem: 0, p_ThapDiem: 0, tongDienNang: 0,
    tien_KhongTheoTG: 0, tien_BinhThuong: 0, tien_CaoDiem: 0, tien_ThapDiem: 0, tongThanhTien: 0
  });

  // Tính tăng trưởng so với tháng trước
  const getGrowth = (current: ElectricityUsage) => {
    const prevMonth = current.thang === 1 ? 12 : current.thang - 1;
    const prevYear = current.thang === 1 ? current.nam - 1 : current.nam;
    
    const prevData = data.find(d => 
      d.maKhachHang === current.maKhachHang && 
      d.thang === prevMonth && 
      d.nam === prevYear
    );

    if (!prevData || prevData.tongDienNang === 0) return null;
    const growth = ((current.tongDienNang - prevData.tongDienNang) / prevData.tongDienNang) * 100;
    return growth;
  };

  useEffect(() => {
    const p_tong = Number(formData.p_KhongTheoTG) + Number(formData.p_BinhThuong) + Number(formData.p_CaoDiem) + Number(formData.p_ThapDiem);
    const t_bt = Number(formData.p_BinhThuong) * Number(formData.gia_BinhThuong);
    const t_cd = Number(formData.p_CaoDiem) * Number(formData.gia_CaoDiem);
    const t_td = Number(formData.p_ThapDiem) * Number(formData.gia_ThapDiem);
    const t_ko = Number(formData.p_KhongTheoTG) * Number(formData.gia_KhongTheoTG);

    setFormData(prev => ({
      ...prev,
      tongDienNang: p_tong,
      tien_KhongTheoTG: t_ko,
      tien_BinhThuong: t_bt,
      tien_CaoDiem: t_cd,
      tien_ThapDiem: t_td,
      tongThanhTien: t_ko + t_bt + t_cd + t_td
    }));
  }, [formData.p_KhongTheoTG, formData.p_BinhThuong, formData.p_CaoDiem, formData.p_ThapDiem, 
      formData.gia_KhongTheoTG, formData.gia_BinhThuong, formData.gia_CaoDiem, formData.gia_ThapDiem]);

  const openModal = (item?: ElectricityUsage) => {
    if (item) {
      setFormData(item);
      setEditingId(item.id);
    } else {
      setFormData({
        id: Date.now().toString(), maKhachHang: '', tinh: '', kcnCcn: '', tenKhachHang: '', nam: 2026, thang: 1, capDienAp: '22',
        gia_KhongTheoTG: 0, gia_BinhThuong: 0, gia_CaoDiem: 0, gia_ThapDiem: 0,
        p_KhongTheoTG: 0, p_BinhThuong: 0, p_CaoDiem: 0, p_ThapDiem: 0, tongDienNang: 0,
        tien_KhongTheoTG: 0, tien_BinhThuong: 0, tien_CaoDiem: 0, tien_ThapDiem: 0, tongThanhTien: 0
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      setData(data.map(d => d.id === editingId ? formData : d));
    } else {
      setData([...data, formData]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 p-4 bg-slate-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight flex items-center gap-2">
            <Zap className="text-amber-500" size={24} />
            QUẢN LÝ SỬ DỤNG ĐIỆN
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest text-emerald-600">Phân tích tăng trưởng & Doanh thu</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-all text-xs font-bold uppercase shadow-sm">
            <FileSpreadsheet size={16} /> Xuất Excel
          </button>
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-[#1e3a5f] text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all text-xs font-bold uppercase shadow-md">
            <Plus size={16} /> Thêm chỉ số
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse min-w-[2400px]">
            <thead className="bg-[#1e3a5f] text-white uppercase text-center">
              <tr>
                <th rowSpan={2} className="px-2 py-3 border border-slate-600 sticky left-0 bg-[#1e3a5f] z-10 w-12">TT</th>
                <th rowSpan={2} className="px-3 py-3 border border-slate-600 sticky left-12 bg-[#1e3a5f] z-10 w-32">Mã KH</th>
                <th rowSpan={2} className="px-3 py-3 border border-slate-600">Tỉnh</th>
                <th rowSpan={2} className="px-3 py-3 border border-slate-600">KCN/CCN</th>
                <th rowSpan={2} className="px-3 py-3 border border-slate-600 w-64">Tên Khách Hàng</th>
                <th rowSpan={2} className="px-2 py-3 border border-slate-600 w-20">Tháng/Năm</th>
                <th colSpan={4} className="px-3 py-2 border border-slate-600 bg-blue-900/50">Giá bán điện (đ)</th>
                <th colSpan={6} className="px-3 py-2 border border-slate-600 bg-orange-900/50">Điện năng tiêu thụ (kWh)</th>
                <th colSpan={5} className="px-3 py-2 border border-slate-600 bg-emerald-900/50">Thành tiền (đ)</th>
                <th rowSpan={2} className="px-3 py-3 border border-slate-600 sticky right-0 bg-[#1e3a5f] z-10">Thao tác</th>
              </tr>
              <tr className="bg-[#2c4e7a] text-[10px]">
                <th>Ko theo TG</th><th>Bình thường</th><th>Cao điểm</th><th>Thấp điểm</th>
                <th>Ko theo TG</th><th>Bình thường</th><th>Cao điểm</th><th>Thấp điểm</th><th className="bg-orange-800/40">Tổng P</th>
                <th className="bg-amber-600/40 font-black italic">Tăng trưởng (%)</th>
                <th>Ko theo TG</th><th>Bình thường</th><th>Cao điểm</th><th>Thấp điểm</th><th className="bg-emerald-800/40">Tổng Tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.map((item, index) => {
                const growth = getGrowth(item);
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors text-slate-700 font-medium">
                    <td className="p-2 text-center border sticky left-0 bg-white">{index + 1}</td>
                    <td className="p-2 text-center border font-bold text-rose-600 sticky left-12 bg-white">{item.maKhachHang}</td>
                    <td className="p-2 border text-center">{item.tinh}</td>
                    <td className="p-2 border text-center">{item.kcnCcn}</td>
                    <td className="p-2 border font-bold text-slate-900 uppercase leading-tight">{item.tenKhachHang}</td>
                    <td className="p-2 border text-center font-bold text-blue-700">{item.thang}/{item.nam}</td>
                    <td className="p-2 border text-right">{item.gia_KhongTheoTG.toLocaleString()}</td>
                    <td className="p-2 border text-right">{item.gia_BinhThuong.toLocaleString()}</td>
                    <td className="p-2 border text-right">{item.gia_CaoDiem.toLocaleString()}</td>
                    <td className="p-2 border text-right">{item.gia_ThapDiem.toLocaleString()}</td>
                    <td className="p-2 border text-right">{item.p_KhongTheoTG.toLocaleString()}</td>
                    <td className="p-2 border text-right">{item.p_BinhThuong.toLocaleString()}</td>
                    <td className="p-2 border text-right">{item.p_CaoDiem.toLocaleString()}</td>
                    <td className="p-2 border text-right">{item.p_ThapDiem.toLocaleString()}</td>
                    <td className="p-2 border text-right font-black text-orange-700 bg-orange-50/50">{item.tongDienNang.toLocaleString()}</td>
                    {/* Cột Tăng trưởng */}
                    <td className={`p-2 border text-center font-bold bg-amber-50/30 ${growth !== null ? (growth >= 0 ? 'text-emerald-600' : 'text-rose-600') : 'text-slate-400'}`}>
                      {growth !== null ? (
                        <div className="flex items-center justify-center gap-1">
                          {growth >= 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                          {growth.toFixed(1)}%
                        </div>
                      ) : '--'}
                    </td>
                    <td className="p-2 border text-right">{item.tien_KhongTheoTG.toLocaleString()}</td>
                    <td className="p-2 border text-right">{item.tien_BinhThuong.toLocaleString()}</td>
                    <td className="p-2 border text-right">{item.tien_CaoDiem.toLocaleString()}</td>
                    <td className="p-2 border text-right">{item.tien_ThapDiem.toLocaleString()}</td>
                    <td className="p-2 border text-right font-black text-emerald-700 bg-emerald-50/50">{item.tongThanhTien.toLocaleString()}</td>
                    <td className="p-2 border text-center sticky right-0 bg-white shadow-[-4px_0_10px_rgba(0,0,0,0.05)]">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openModal(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => setData(data.filter(d => d.id !== item.id))} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b flex justify-between items-center bg-[#1e3a5f] text-white">
              <div className="flex items-center gap-2">
                <Calculator size={20} className="text-amber-400" />
                <h2 className="font-black uppercase tracking-wide">Cập nhật chỉ số sử dụng điện</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-4 grid grid-cols-5 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Mã khách hàng</label>
                  <input type="text" value={formData.maKhachHang} onChange={(e) => setFormData({ ...formData, maKhachHang: e.target.value })} className="w-full px-3 py-2 border rounded-lg font-bold text-rose-600" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tỉnh</label>
                  <input type="text" value={formData.tinh} onChange={(e) => setFormData({ ...formData, tinh: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">KCN/CCN</label>
                  <input type="text" value={formData.kcnCcn} onChange={(e) => setFormData({ ...formData, kcnCcn: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tên Khách Hàng</label>
                  <input type="text" value={formData.tenKhachHang} onChange={(e) => setFormData({ ...formData, tenKhachHang: e.target.value })} className="w-full px-3 py-2 border rounded-lg font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tháng/Năm</label>
                  <div className="flex gap-2">
                    <input type="number" value={formData.thang} onChange={(e) => setFormData({ ...formData, thang: parseInt(e.target.value) })} className="w-1/2 px-2 py-2 border rounded-lg text-center" />
                    <input type="number" value={formData.nam} onChange={(e) => setFormData({ ...formData, nam: parseInt(e.target.value) })} className="w-1/2 px-2 py-2 border rounded-lg text-center" />
                  </div>
                </div>
              </div>

              {/* Nhập Sản lượng */}
              <div className="md:col-span-2 space-y-3 bg-orange-50/30 p-4 rounded-xl border border-orange-100">
                <h3 className="text-xs font-black text-orange-700 uppercase flex items-center gap-2">
                  <TrendingUp size={16} /> 1. Sản lượng tiêu thụ (kWh)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {['p_BinhThuong', 'p_CaoDiem', 'p_ThapDiem', 'p_KhongTheoTG'].map((field) => (
                    <div key={field} className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">{field.split('_')[1]}</label>
                      <input 
                        type="number" 
                        value={(formData as any)[field]} 
                        onChange={(e) => setFormData({ ...formData, [field]: Number(e.target.value) })} 
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 ring-orange-200 outline-none" 
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Nhập Giá bán */}
              <div className="md:col-span-2 space-y-3 bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                <h3 className="text-xs font-black text-blue-700 uppercase flex items-center gap-2">
                  <Zap size={16} /> 2. Giá bán điện (VNĐ)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                   {['gia_BinhThuong', 'gia_CaoDiem', 'gia_ThapDiem', 'gia_KhongTheoTG'].map((field) => (
                    <div key={field} className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">{field.split('_')[1]}</label>
                      <input 
                        type="number" 
                        value={(formData as any)[field]} 
                        onChange={(e) => setFormData({ ...formData, [field]: Number(e.target.value) })} 
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 ring-blue-200 outline-none" 
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Kết quả Tổng */}
              <div className="md:col-span-4 bg-emerald-900 text-white p-5 rounded-xl shadow-inner flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-emerald-300 font-bold uppercase mb-1">Tổng sản lượng tiêu thụ</p>
                  <p className="text-3xl font-black">{formData.tongDienNang.toLocaleString()} <span className="text-sm font-light">kWh</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-emerald-300 font-bold uppercase mb-1">Tổng thành tiền (Tạm tính)</p>
                  <p className="text-3xl font-black text-amber-400">{formData.tongThanhTien.toLocaleString()} <span className="text-sm font-light text-white">VNĐ</span></p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-slate-500 font-bold text-[10px] uppercase">Hủy bỏ</button>
              <button onClick={handleSave} className="px-8 py-2 bg-[#1e3a5f] text-white rounded-lg font-bold shadow-md text-[10px] uppercase flex items-center gap-2 hover:bg-slate-800 transition-all">
                <Save size={16} /> Lưu dữ liệu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}