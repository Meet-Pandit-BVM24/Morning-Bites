import { useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Package, Users, UserPlus, RefreshCw, CheckCircle2, Utensils } from "lucide-react";

export default function SubReports() {
  const { customers, packages, customerPackages } = useStore();

  const activeSubs = customers.filter(c => c.status === 'active' && !c.is_deleted);
  const activePacks = activeSubs.filter(c => c.used < c.total);
  const newlySub = activeSubs.filter(c => c.renew_count === 0);
  const renewCustomers = activeSubs.filter(c => c.renew_count > 0);

  const totalMealsServed = (() => {
    if (customerPackages.length > 0) {
      return customerPackages.reduce((s, cp) => s + cp.used, 0);
    }
    return customers.filter(c => !c.is_deleted).reduce((s, c) => s + c.used, 0);
  })();

  const numPackages = packages.filter(p => p.is_active).length;

  const stats = [
    {
      label: "Packages Available",
      value: numPackages,
      icon: <Package className="w-5 h-5" />,
      color: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-950/20",
      border: "border-violet-200 dark:border-violet-900/40"
    },
    {
      label: "Total Subscribed",
      value: activeSubs.length,
      icon: <Users className="w-5 h-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      border: "border-blue-200 dark:border-blue-900/40"
    },
    {
      label: "Newly Subscribed",
      value: newlySub.length,
      icon: <UserPlus className="w-5 h-5" />,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950/20",
      border: "border-green-200 dark:border-green-900/40"
    },
    {
      label: "Active Packs",
      value: activePacks.length,
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "text-primary",
      bg: "bg-primary/5",
      border: "border-primary/20"
    },
    {
      label: "Renewed Customers",
      value: renewCustomers.length,
      icon: <RefreshCw className="w-5 h-5" />,
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-950/20",
      border: "border-orange-200 dark:border-orange-900/40"
    },
    {
      label: "Meals Served",
      value: totalMealsServed,
      icon: <Utensils className="w-5 h-5" />,
      color: "text-secondary-foreground",
      bg: "bg-secondary/10",
      border: "border-secondary/30"
    },
  ];

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300 pb-8">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" /> Sub Reports
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(s => (
          <Card key={s.label} className={`border ${s.border} ${s.bg} shadow-sm`}>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${s.color}`}>
                {s.icon} {s.label}
              </div>
              <div className="text-3xl font-black text-foreground">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
