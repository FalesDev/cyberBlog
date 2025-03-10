import { createContext, useContext, useState } from "react";

interface DataContextType {
  refreshCount: number;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType>({
  refreshCount: 0,
  refreshData: () => {},
});

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [refreshCount, setRefreshCount] = useState(0);

  const refreshData = () => {
    setRefreshCount((prev) => prev + 1);
  };

  return (
    <DataContext.Provider value={{ refreshCount, refreshData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
