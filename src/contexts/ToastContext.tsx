// src/contexts/ToastContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import Toast, { ToastType } from "../components/common/Toast";

interface ToastConfig {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  position?: "top" | "bottom";
}

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toastConfig, setToastConfig] = useState<ToastConfig | null>(null);
  const [visible, setVisible] = useState(false);

  const showToast = (config: ToastConfig) => {
    setToastConfig(config);
    setVisible(true);
  };

  const hideToast = () => {
    setVisible(false);
    // Clear config after animation completes
    setTimeout(() => setToastConfig(null), 300);
  };

  const showSuccess = (title: string, message?: string) => {
    showToast({ type: "success", title, message });
  };

  const showError = (title: string, message?: string) => {
    showToast({ type: "error", title, message });
  };

  const showWarning = (title: string, message?: string) => {
    showToast({ type: "warning", title, message });
  };

  const showInfo = (title: string, message?: string) => {
    showToast({ type: "info", title, message });
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideToast,
      }}
    >
      {children}
      {toastConfig && (
        <Toast
          visible={visible}
          type={toastConfig.type}
          title={toastConfig.title}
          message={toastConfig.message}
          duration={toastConfig.duration}
          position={toastConfig.position}
          onHide={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
};
