import type { ReadinessCheck } from "../../lib/types";
import { formatChecklistLabel } from "../../lib/format";
import { StatusBadge } from "../ui/StatusBadge";

interface Item {
  label: string;
  ok: boolean;
}

export function SetupChecklist({
  items,
}: {
  items: Item[] | ReadinessCheck[];
}) {
  return (
    <div className="checklist">
      {items.map((item) => (
        <div key={item.label} className="checklist__item">
          <span>{item.label}</span>
          <StatusBadge tone={item.ok ? "success" : "warning"}>
            {formatChecklistLabel(item.ok)}
          </StatusBadge>
        </div>
      ))}
    </div>
  );
}
