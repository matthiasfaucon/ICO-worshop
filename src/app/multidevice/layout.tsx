import { MultiDeviceProvider } from "@/context/MultiDeviceProvider";

export default function MultiDeviceLayout({ children }: { children: React.ReactNode }) {
  return <MultiDeviceProvider>{children}</MultiDeviceProvider>;
}
