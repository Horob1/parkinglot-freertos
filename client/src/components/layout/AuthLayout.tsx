import { authStore } from "@/store";
import { Outlet, Navigate } from "react-router-dom";

export const AuthLayout = () => {
  const { auth } = authStore();

  // Nếu chưa đăng nhập, chuyển hướng đến trang login
  if (auth) return <Navigate to="/" replace />;

  return (
    <div>
      <Outlet />
    </div>
  );
};
