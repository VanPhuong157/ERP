'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, X, FileSpreadsheet, UserPlus } from 'lucide-react';

interface Customer {
  id: string;
  maKhachHang: string;
  tinh: string;
  kcnCcn: string;
  tenKhachHang: string;
  diaChi: string;
  ngayKyHopDong: string;
  thoiHanHopDong: string;
  maSoThue: string;
  soTaiKhoan: string;
  email: string;
  dienThoai: string;
  diaDiemSuDungDien: string;
  diemDauNoiCapDien: string;
  mucDichSuDungDien: string;
  capDienAp: string;
  congSuatCucDai: string;
  congSuatTrungBinhNgay: string;
  congSuatNhoNhat: string;
  sanLuongDangKy: string;
  hoSoPhapLy: string; // File đính kèm
}

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      maKhachHang: 'EM2410223393',
      tinh: 'Hải Phòng',
      kcnCcn: 'KCN Đình Vũ',
      tenKhachHang: 'CÔNG TY CỔ PHẦN THIẾT BỊ ĐIỆN NANO - PHƯỚC THẠNH',
      diaChi: 'Lô CN 3.2D, Đình Vũ, Hải An, Hải Phòng',
      ngayKyHopDong: '2024-01-15',
      thoiHanHopDong: '5 năm',
      maSoThue: '0201034009',
      soTaiKhoan: '030008831668 - Sacombank',
      email: 'ketoan-nano@nanoco.com.vn',
      dienThoai: '0225 3260 186',
      diaDiemSuDungDien: 'Lô CN 3.2D, Đình Vũ',
      diemDauNoiCapDien: 'TBA 630kVA',
      mucDichSuDungDien: 'Sản xuất',
      capDienAp: '22',
      congSuatCucDai: '630',
      congSuatTrungBinhNgay: '450',
      congSuatNhoNhat: '100',
      sanLuongDangKy: '150000',
      hoSoPhapLy: 'Giấy ĐKKD.pdf'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Customer>({
    id: '', maKhachHang: '', tinh: '', kcnCcn: '', tenKhachHang: '', diaChi: '',
    ngayKyHopDong: '', thoiHanHopDong: '', maSoThue: '', soTaiKhoan: '',
    email: '', dienThoai: '', diaDiemSuDungDien: '', diemDauNoiCapDien: '',
    mucDichSuDungDien: '', capDienAp: '', congSuatCucDai: '',
    congSuatTrungBinhNgay: '', congSuatNhoNhat: '', sanLuongDangKy: '', hoSoPhapLy: ''
  });

  const openModal = (customer?: Customer) => {
    if (customer) {
      setFormData(customer);
      setEditingId(customer.id);
    } else {
      setFormData({
        id: Date.now().toString(), maKhachHang: '', tinh: '', kcnCcn: '', tenKhachHang: '',
        diaChi: '', ngayKyHopDong: '', thoiHanHopDong: '', maSoThue: '',
        soTaiKhoan: '', email: '', dienThoai: '', diaDiemSuDungDien: '',
        diemDauNoiCapDien: '', mucDichSuDungDien: '', capDienAp: '',
        congSuatCucDai: '', congSuatTrungBinhNgay: '', congSuatNhoNhat: '',
        sanLuongDangKy: '', hoSoPhapLy: ''
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      setCustomers(customers.map(c => c.id === editingId ? formData : c));
    } else {
      setCustomers([...customers, formData]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 p-4 bg-slate-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight">Quản lý thông tin khách hàng</h1>
          <p className="text-xs text-slate-400 mt-1">Hệ thống quản lý hồ sơ và thông số kỹ thuật điện</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-all text-xs font-bold uppercase shadow-sm">
            <FileSpreadsheet size={16} /> Xuất dữ liệu
          </button>
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-[#1e3a5f] text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all text-xs font-bold uppercase shadow-sm">
            <Plus size={16} /> Thêm khách hàng
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] text-left border-collapse min-w-[2500px]">
            <thead className="bg-[#1e3a5f] text-white uppercase">
              <tr>
                <th className="px-3 py-4 border border-slate-600 text-center sticky left-0 bg-[#1e3a5f]">TT</th>
                <th className="px-3 py-4 border border-slate-600 text-center sticky left-10 bg-[#1e3a5f]">Mã khách hàng</th>
                <th className="px-3 py-4 border border-slate-600">Tỉnh</th>
                <th className="px-3 py-4 border border-slate-600">KCN/CCN</th>
                <th className="px-3 py-4 border border-slate-600 w-64">Tên khách hàng</th>
                <th className="px-3 py-4 border border-slate-600 w-64">Địa chỉ</th>
                <th className="px-3 py-4 border border-slate-600 text-center">Ngày ký HĐ</th>
                <th className="px-3 py-4 border border-slate-600 text-center">Thời hạn HĐ</th>
                <th className="px-3 py-4 border border-slate-600">Mã số thuế</th>
                <th className="px-3 py-4 border border-slate-600">Số tài khoản</th>
                <th className="px-3 py-4 border border-slate-600">Email</th>
                <th className="px-3 py-4 border border-slate-600">Điện thoại</th>
                <th className="px-3 py-4 border border-slate-600">Địa điểm sử dụng điện</th>
                <th className="px-3 py-4 border border-slate-600">Điểm đấu nối cấp điện</th>
                <th className="px-3 py-4 border border-slate-600">Mục đích sử dụng điện</th>
                <th className="px-3 py-4 border border-slate-600 text-center">Cấp điện áp(kV)</th>
                <th className="px-3 py-4 border border-slate-600 text-center">Công suất cực đại(kW)</th>
                <th className="px-3 py-4 border border-slate-600 text-center">Công suất sử dụng TB ngày(kW)</th>
                <th className="px-3 py-4 border border-slate-600 text-center">Công suất nhỏ nhất(kW)</th>
                <th className="px-3 py-4 border border-slate-600 text-center">Sản lượng điện đăng ký TB tháng(kWh)</th>
                <th className="px-3 py-4 border border-slate-600 text-center">Hồ sơ pháp lý</th>
                <th className="px-3 py-4 border border-slate-600 text-center sticky right-0 bg-[#1e3a5f]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {customers.map((c, index) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors text-slate-700 font-medium">
                  <td className="px-3 py-3 text-center border sticky left-0 bg-white">{index + 1}</td>
                  <td className="px-3 py-3 text-center border font-bold text-rose-600 sticky left-10 bg-white">{c.maKhachHang}</td>
                  <td className="px-3 py-3 border">{c.tinh}</td>
                  <td className="px-3 py-3 border">{c.kcnCcn}</td>
                  <td className="px-3 py-3 border font-bold text-slate-900">{c.tenKhachHang}</td>
                  <td className="px-3 py-3 border text-[10px] leading-tight text-slate-500">{c.diaChi}</td>
                  <td className="px-3 py-3 border text-center">{c.ngayKyHopDong}</td>
                  <td className="px-3 py-3 border text-center">{c.thoiHanHopDong}</td>
                  <td className="px-3 py-3 border font-mono">{c.maSoThue}</td>
                  <td className="px-3 py-3 border text-[10px]">{c.soTaiKhoan}</td>
                  <td className="px-3 py-3 border text-blue-600">{c.email}</td>
                  <td className="px-3 py-3 border font-bold">{c.dienThoai}</td>
                  <td className="px-3 py-3 border text-slate-500">{c.diaDiemSuDungDien}</td>
                  <td className="px-3 py-3 border">{c.diemDauNoiCapDien}</td>
                  <td className="px-3 py-3 border">{c.mucDichSuDungDien}</td>
                  <td className="px-3 py-3 border text-center font-bold">{c.capDienAp}</td>
                  <td className="px-3 py-3 border text-center text-rose-600 font-bold">{c.congSuatCucDai}</td>
                  <td className="px-3 py-3 border text-center">{c.congSuatTrungBinhNgay}</td>
                  <td className="px-3 py-3 border text-center">{c.congSuatNhoNhat}</td>
                  <td className="px-3 py-3 border text-center font-mono">{c.sanLuongDangKy}</td>
                  <td className="px-3 py-3 border text-center text-blue-500 underline cursor-pointer italic">{c.hoSoPhapLy}</td>
                  <td className="px-3 py-3 border text-center sticky right-0 bg-white shadow-[-4px_0_10px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openModal(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={14} /></button>
                      <button onClick={() => setCustomers(customers.filter(item => item.id !== c.id))} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b flex justify-between items-center bg-slate-50">
              <h2 className="font-black text-[#1e3a5f] uppercase tracking-wide">Cập nhật thông tin khách hàng</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1 space-y-1">
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
                <label className="text-[10px] font-bold text-slate-500 uppercase">Mã số thuế</label>
                <input type="text" value={formData.maSoThue} onChange={(e) => setFormData({ ...formData, maSoThue: e.target.value })} className="w-full px-3 py-2 border rounded-lg font-mono" />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Tên Khách Hàng</label>
                <input type="text" value={formData.tenKhachHang} onChange={(e) => setFormData({ ...formData, tenKhachHang: e.target.value })} className="w-full px-3 py-2 border rounded-lg font-bold" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Địa chỉ</label>
                <input type="text" value={formData.diaChi} onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Ngày ký HĐ</label>
                <input type="date" value={formData.ngayKyHopDong} onChange={(e) => setFormData({ ...formData, ngayKyHopDong: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Thời hạn HĐ</label>
                <input type="text" value={formData.thoiHanHopDong} onChange={(e) => setFormData({ ...formData, thoiHanHopDong: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Điện thoại</label>
                <input type="text" value={formData.dienThoai} onChange={(e) => setFormData({ ...formData, dienThoai: e.target.value })} className="w-full px-3 py-2 border rounded-lg font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>

              <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-blue-600 uppercase">Địa điểm sử dụng điện</label>
                  <input type="text" value={formData.diaDiemSuDungDien} onChange={(e) => setFormData({ ...formData, diaDiemSuDungDien: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-blue-50/30" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-blue-600 uppercase">Điểm đấu nối</label>
                  <input type="text" value={formData.diemDauNoiCapDien} onChange={(e) => setFormData({ ...formData, diemDauNoiCapDien: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-blue-50/30" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-blue-600 uppercase">Mục đích SD điện</label>
                  <input type="text" value={formData.mucDichSuDungDien} onChange={(e) => setFormData({ ...formData, mucDichSuDungDien: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-blue-50/30" />
                </div>
              </div>

              <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Cấp áp (kV)</label>
                  <input type="text" value={formData.capDienAp} onChange={(e) => setFormData({ ...formData, capDienAp: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">P Cực đại</label>
                  <input type="text" value={formData.congSuatCucDai} onChange={(e) => setFormData({ ...formData, congSuatCucDai: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">P TB ngày</label>
                  <input type="text" value={formData.congSuatTrungBinhNgay} onChange={(e) => setFormData({ ...formData, congSuatTrungBinhNgay: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Sản lượng TB</label>
                  <input type="text" value={formData.sanLuongDangKy} onChange={(e) => setFormData({ ...formData, sanLuongDangKy: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Hồ sơ pháp lý</label>
                  <input type="text" value={formData.hoSoPhapLy} onChange={(e) => setFormData({ ...formData, hoSoPhapLy: e.target.value })} className="w-full px-3 py-2 border rounded-lg italic" placeholder="Tên file..." />
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg text-slate-600 font-bold hover:bg-slate-200 transition-all uppercase text-[10px]">Hủy</button>
              <button onClick={handleSave} className="px-8 py-2 bg-[#1e3a5f] text-white rounded-lg font-bold hover:bg-slate-800 transition-all shadow-md uppercase text-[10px]">Lưu dữ liệu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}