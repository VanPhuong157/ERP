"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Menu,
  LogOut,
  Package,
  Wrench,
  Calendar,
  Warehouse,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Building2,
  Users,
  Briefcase,
  Wallet,
  Truck,
  ShieldCheck,
  FileSpreadsheet,
  UserPlus,
  Award,
  KeyRound,
  FileX,
} from "lucide-react";

// Import các trang
import DashboardPage from "../page/dashboard/Dashboard";
import EquipmentAssetPage from "../page/equipment/EquipmentAsset";
import InventoryPage from "../page/inventory/Inventory";
import SpecificationsPage from "../page/specification/Specifications";
import OperatingEquipmentPage from "../page/maintenance/OperatingEquipment";
import LoginPage from "../page/authen/Login";
import CustomerManagementPage from "../page/electric/CustomerManagement";
import ElectricityPurchasePage from "../page/electric/ElectricityPurchase";
import TaskManagementPage from "../page/task/TaskManagementPage";
import RegisterUserPage from "../page/authen/RegisterUserPage";
import ChangePasswordPage from "../page/authen/changePass";
import EmployeeManagerPage from "../page/authen/EmployeeManager";
import LeaveManagementPage from "../page/leave/LeaveManagementPage";

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  company: string;
  deptId: string;
  deptName: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useAppContext must be used within AppProvider");
  return context;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState("task-registration");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState<string[]>([
    "VNEB",
    "VHS",
    "admin-section",
  ]);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [activeDept, setActiveDept] = useState<{
    id: string;
    name: string;
    companyId: string;
  } | null>(null);

  useEffect(() => {
    const loadSavedAuth = () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const userData = {
            id: localStorage.getItem("userId") || "",
            name: localStorage.getItem("fullName") || "User",
            username: localStorage.getItem("username") || "",
            role: (localStorage.getItem("role") || "Staff").toUpperCase(),
            company: (localStorage.getItem("company") || "").toUpperCase(),
            deptId: localStorage.getItem("departmentId") || "",
            deptName: localStorage.getItem("departmentName") || "",
          };
          setUser(userData);
          setActiveDept({
            id: userData.deptId,
            name: userData.deptName,
            companyId: userData.company,
          });
        }
      } finally {
        setIsLoadingAuth(false);
      }
    };
    loadSavedAuth();
  }, []);

  const menuStructure = [
    {
      id: "admin-section",
      label: "Quản trị hệ thống",
      icon: ShieldCheck,
      children: [
        { id: "user-registration", label: "Cấp tài khoản", icon: UserPlus },
      ],
    },

    {
      id: "VNEB",
      label: "Công ty VNEB",
      icon: Building2,
      children: [
        {
          id: "vneb-bod",
          label: "Ban Tổng Giám đốc",
          icon: Award,
          deptId: "4",
          accessRoles: ["CHAIRMAN", "BOD", "ADMIN"],
          children: [
            {
              id: "dept-dashboard",
              label: "Báo cáo Dashboard",
              icon: BarChart3,
            },
            {
              id: "task-registration",
              label: "Đăng ký nhiệm vụ",
              icon: FileSpreadsheet,
            },
          ],
        },
        {
          id: "resignation",
          label: "Quản lý nghỉ phép",
          icon: Calendar,
        },
        {
          id: "vneb-kythuat",
          label: "Phòng Kĩ thuật- Vận hành",
          deptId: "5",
          icon: Wrench,
          children: [
            {
              id: "dept-dashboard",
              label: "Báo cáo Dashboard",
              icon: BarChart3,
            },
            {
              id: "task-registration",
              label: "Đăng ký nhiệm vụ",
              icon: FileSpreadsheet,
            },
            { id: "equipment", label: "Quản lý Xuất - Nhập", icon: Package },
            { id: "inventory", label: "Kho vật tư", icon: Warehouse },
            { id: "specifications", label: "Quản lý thiết bị", icon: Wrench },
            { id: "schedule", label: "Thiết bị vận hành", icon: Calendar },
          ],
        },
        {
          id: "vneb-kinhdoanh",
          label: "Phòng Kinh doanh điện",
          deptId: "3",
          icon: Users,
          children: [
            {
              id: "dept-dashboard",
              label: "Báo cáo Dashboard",
              icon: BarChart3,
            },
            {
              id: "task-registration",
              label: "Đăng ký nhiệm vụ",
              icon: FileSpreadsheet,
            },
            { id: "customers", label: "Quản lý khách hàng", icon: Users },
            { id: "electricity", label: "Mua bán điện", icon: Package },
          ],
        },
      ],
    },
    {
      id: "VHS",
      label: "Công ty VHS",
      icon: Building2,
      children: [
        {
          id: "vhs-bod",
          label: "Ban Tổng Giám đốc",
          icon: Award,
          deptId: "4",
          accessRoles: ["CHAIRMAN", "BOD", "ADMIN"],
          children: [
            {
              id: "dept-dashboard",
              label: "Báo cáo Dashboard",
              icon: BarChart3,
            },
            {
              id: "task-registration",
              label: "Đăng ký nhiệm vụ",
              icon: FileSpreadsheet,
            },
          ],
        },
        {
          id: "resignation",
          label: "Quản lý nghỉ phép",
          icon: Calendar,
        },
        {
          id: "vhs-ketoan",
          label: "Phòng Tài chính-Kế toán",
          icon: Wallet,
          deptId: "6",
          children: [
            {
              id: "dept-dashboard",
              label: "Báo cáo Dashboard",
              icon: BarChart3,
            },
            {
              id: "task-registration",
              label: "Đăng ký nhiệm vụ",
              icon: FileSpreadsheet,
            },
          ],
        },
        {
          id: "vhs-hcns",
          label: "Phòng HCNS",
          icon: Users,
          deptId: "7",
          children: [
            {
              id: "dept-dashboard",
              label: "Báo cáo Dashboard",
              icon: BarChart3,
            },
            {
              id: "task-registration",
              label: "Đăng ký nhiệm vụ",
              icon: FileSpreadsheet,
            },
            { id: "employee-manager", label: "Quản lý nhân sự", icon: Users },
          ],
        },
        {
          id: "vhs-kehoach",
          label: "Phòng Kế hoạch - Đầu tư",
          icon: Calendar,
          deptId: "2",
          children: [
            {
              id: "dept-dashboard",
              label: "Báo cáo Dashboard",
              icon: BarChart3,
            },
            {
              id: "task-registration",
              label: "Đăng ký nhiệm vụ",
              icon: FileSpreadsheet,
            },
          ],
        },
        {
          id: "vhs-kythuat",
          label: "Phòng Kỹ thuật-Công nghệ",
          icon: Wrench,
          deptId: "8",
          children: [
            {
              id: "dept-dashboard",
              label: "Báo cáo Dashboard",
              icon: BarChart3,
            },
            {
              id: "task-registration",
              label: "Đăng ký nhiệm vụ",
              icon: FileSpreadsheet,
            },
          ],
        },
        {
          id: "vhs-duan",
          label: "Phòng Quản lý dự án",
          icon: Briefcase,
          deptId: "9",
          children: [
            {
              id: "dept-dashboard",
              label: "Báo cáo Dashboard",
              icon: BarChart3,
            },
            {
              id: "task-registration",
              label: "Đăng ký nhiệm vụ",
              icon: FileSpreadsheet,
            },
          ],
        },
        {
          id: "vhs-kinhdoanh",
          label: "Phòng Kinh doanh",
          icon: Users,
          deptId: "10",
          children: [
            {
              id: "dept-dashboard",
              label: "Báo cáo Dashboard",
              icon: BarChart3,
            },
            {
              id: "task-registration",
              label: "Đăng ký nhiệm vụ",
              icon: FileSpreadsheet,
            },
          ],
        },
        {
          id: "vhs-logistics",
          label: "Phòng Logistics",
          icon: Truck,
          deptId: "11",
          children: [
            {
              id: "dept-dashboard",
              label: "Báo cáo Dashboard",
              icon: BarChart3,
            },
            {
              id: "task-registration",
              label: "Đăng ký nhiệm vụ",
              icon: FileSpreadsheet,
            },
          ],
        },
      ],
    },
  ];

  const getFilteredMenu = (
    items: any[],
    parentDeptId: string | null = null,
    parentDeptName: string | null = null, // Thêm tham số này
    parentId: string | null = null,
  ): any[] => {
    if (!user) return [];
    const role = user.role.toUpperCase();
    const userCompany = user.company.toUpperCase();

    return items
      .filter((item) => {
        if (item.id === "admin-section") return role === "ADMIN";
        if (item.id === "VNEB" || item.id === "VHS")
          return (
            role === "ADMIN" || role === "CHAIRMAN" || userCompany === item.id
          );
        if (item.accessRoles) return item.accessRoles.includes(role);

        const currentId = item.deptId || parentDeptId;
        if (
          role !== "ADMIN" &&
          role !== "CHAIRMAN" &&
          role !== "BOD" &&
          currentId
        ) {
          return currentId === user.deptId;
        }
        return true;
      })
      .map((item) => {
        const currentDeptId = item.deptId || parentDeptId;
        const currentDeptName = item.deptId ? item.label : parentDeptName; // Kế thừa tên phòng ban
        const currentParentId =
          parentId ||
          (item.id === "VNEB" || item.id === "VHS" ? item.id : null);
        if (item.children)
          return {
            ...item,
            deptId: currentDeptId,
            deptName: currentDeptName, // Gán vào item
            parentCompanyId: currentParentId,
            children: getFilteredMenu(
              item.children,
              currentDeptId,
              currentDeptName, // Truyền xuống cấp con
              currentParentId,
            ),
          };
        return {
          ...item,
          deptId: currentDeptId,
          deptName: currentDeptName, // Gán vào item
          parentCompanyId: currentParentId,
        };
      });
  };

  const NavItem = ({ item, level = 0 }: { item: any; level?: number }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus.includes(item.id);
    const isSameDept = !item.deptId || activeDept?.id === item.deptId;
    const isSameCompany =
      !item.parentCompanyId || activeDept?.companyId === item.parentCompanyId;
    const isActive = currentPage === item.id && isSameDept && isSameCompany;

    return (
      <div key={item.id} className="w-full">
        <button
          onClick={() => {
            if (hasChildren) {
              setOpenMenus((prev) =>
                prev.includes(item.id)
                  ? prev.filter((i) => i !== item.id)
                  : [...prev, item.id],
              );
            } else {
              setCurrentPage(item.id);
              // Sửa logic truyền activeDept ở đây
              if (item.deptId) {
                setActiveDept({
                  id: item.deptId,
                  name: item.deptName || "Phòng ban", // Lấy tên phòng ban đã map ở getFilteredMenu
                  companyId: item.parentCompanyId,
                });
              }
            }
          }}
          className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isActive ? "bg-blue-600 text-white font-medium shadow-lg" : "text-slate-300 hover:bg-slate-800"}`}
          style={{
            paddingLeft: sidebarOpen ? `${(level + 1) * 12}px` : "16px",
          }}
        >
          <item.icon
            className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400"}`}
          />
          {sidebarOpen && (
            <span className="flex-1 text-left truncate">{item.label}</span>
          )}
          {sidebarOpen &&
            hasChildren &&
            (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        </button>
        {hasChildren && isOpen && sidebarOpen && (
          <div className="bg-slate-950/20">
            {item.children.map((child: any) => (
              <NavItem key={child.id} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dept-dashboard":
        return (
          <DashboardPage
            targetDeptId={activeDept?.id || user?.deptId}
            title={activeDept?.name || user?.deptName || "Báo cáo tổng hợp"}
          />
        );
      case "user-registration":
        return <RegisterUserPage />;
      case "equipment":
        return <EquipmentAssetPage />;
      case "inventory":
        return <InventoryPage />;
      case "specifications":
        return <SpecificationsPage />;
      case "schedule":
        return <OperatingEquipmentPage />;
      case "customers":
        return <CustomerManagementPage />;
      case "electricity":
        return <ElectricityPurchasePage />;
      case "change-password":
        return <ChangePasswordPage />;
      case "task-registration":
        return <TaskManagementPage targetDept={activeDept} />;
      case "employee-manager":
        return <EmployeeManagerPage />;
      case "resignation":
        return <LeaveManagementPage />;
      default:
        return <TaskManagementPage targetDept={activeDept} />;
    }
  };

  if (isLoadingAuth)
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center text-white">
        Đang tải...
      </div>
    );

  if (!user)
    return (
      <AppContext.Provider
        value={{ user, setUser, currentPage, setCurrentPage }}
      >
        <LoginPage />
      </AppContext.Provider>
    );

  return (
    <AppContext.Provider value={{ user, setUser, currentPage, setCurrentPage }}>
      <div className="flex h-screen bg-slate-100 font-sans text-slate-900">
        <aside
          className={`${sidebarOpen ? "w-64" : "w-20"} bg-slate-900 text-white transition-all duration-300 flex flex-col z-30`}
        >
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-black text-xl">
              V
            </div>
            {sidebarOpen && (
              <span className="text-xl font-black uppercase italic">
                VHS ERP
              </span>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
            {getFilteredMenu(menuStructure).map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </nav>

          <div className="border-t border-slate-800 p-4 space-y-2">
            {sidebarOpen && (
              <div className="px-3 py-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-white truncate text-sm">
                      {user.name}
                    </p>
                    <p className="text-blue-400 text-[10px] font-black uppercase">
                      {user.company} • {user.role}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentPage("change-password")}
                    className={`p-1.5 rounded-lg transition-colors ${currentPage === "change-password" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-700 hover:text-blue-400"}`}
                    title="Đổi mật khẩu"
                  >
                    <KeyRound size={14} />
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                localStorage.clear();
                setUser(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-red-600/20 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              {sidebarOpen && (
                <span className="text-sm font-bold">Đăng xuất</span>
              )}
            </button>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center p-2 text-slate-600 hover:text-white mt-2"
            >
              <Menu size={20} />
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shadow-sm z-20">
            <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">
              Hệ thống Quản trị Doanh nghiệp
            </h1>
            {activeDept && (
              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-blue-100 flex items-center gap-2">
                <Building2 size={12} /> {activeDept.name}
              </div>
            )}
          </header>
          <main className="flex-1 overflow-auto p-8 bg-[#F8FAFC]">
            {renderPage()}
          </main>
        </div>
      </div>
    </AppContext.Provider>
  );
}