import { BadgeCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type FlowItem = {
  step: string;
  stage: string;
  owner: string;
  status: string;
};

type FlowTableProps = {
  rows: FlowItem[];
};

export function FlowTable({ rows }: FlowTableProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Step</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.step}>
              <TableCell>{row.step}</TableCell>
              <TableCell className="font-medium">{row.stage}</TableCell>
              <TableCell>{row.owner}</TableCell>
              <TableCell className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                {row.status}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
