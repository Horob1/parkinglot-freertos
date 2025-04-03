import { createContext, useContext } from "react";

// Tạo Context để chia sẻ contentHeight
export const LayoutContext = createContext<number>(0);

export const useLayout = () => useContext(LayoutContext);