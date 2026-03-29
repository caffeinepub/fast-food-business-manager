import { TrendingDown, TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  icon: React.ReactNode;
  iconBg: string;
}

export default function StatCard({
  title,
  value,
  delta,
  deltaPositive,
  icon,
  iconBg,
}: StatCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border shadow-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm font-medium">
          {title}
        </span>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}
        >
          {icon}
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {delta && (
          <div
            className={`flex items-center gap-1 mt-1 text-xs font-medium ${
              deltaPositive ? "text-success" : "text-destructive"
            }`}
          >
            {deltaPositive ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            {delta}
          </div>
        )}
      </div>
    </div>
  );
}
