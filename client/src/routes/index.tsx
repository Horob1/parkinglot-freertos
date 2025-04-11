import { AuthLayout, MainLayout } from "@/components/layout";
import { Card, Client, Home, Log, Login, NotFound, Setting } from "@/pages";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: "card", element: <Card /> },
      { path: "log", element: <Log /> },
      { path: "client", element: <Client /> },
      { path: "setting", element: <Setting /> },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    errorElement: <NotFound />,
    children: [{ index: true, element: <Login /> }],
  },
  { path: "*", element: <NotFound /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
