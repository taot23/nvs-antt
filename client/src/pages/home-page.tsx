import { useAuth } from "@/hooks/use-auth";
import MainDashboard from "@/components/dashboard/main-dashboard";

export default function HomePage() {
  console.log("Renderizando HomePage");
  const { user } = useAuth();
  console.log("HomePage: user=", user);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <MainDashboard />
    </div>
  );
}
