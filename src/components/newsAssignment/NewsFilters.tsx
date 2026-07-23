import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export type PillarFilter = "All" | "ESG" | "Green Energy" | "Green Tech" | "Electric Mobility" | "Policy & Regulation" | "Green Finance & Markets";
export type SortMode = "newest" | "relevance";

interface Props {
  search: string;
  onSearch: (v: string) => void;
  pillar: PillarFilter;
  onPillarChange: (v: PillarFilter) => void;
  sort: SortMode;
  onSortChange: (v: SortMode) => void;
}

const pillars: PillarFilter[] = ["All", "ESG", "Green Energy", "Green Tech", "Electric Mobility", "Policy & Regulation", "Green Finance & Markets"];

export default function NewsFilters({ search, onSearch, pillar, onPillarChange, sort, onSortChange }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search news by title…"
          className="pl-9 h-9"
        />
      </div>
      <Select value={pillar} onValueChange={(v) => onPillarChange(v as PillarFilter)}>
        <SelectTrigger className="w-full sm:w-[180px] h-9"><SelectValue /></SelectTrigger>
        <SelectContent>
          {pillars.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={sort} onValueChange={(v) => onSortChange(v as SortMode)}>
        <SelectTrigger className="w-full sm:w-[170px] h-9"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest first</SelectItem>
          <SelectItem value="relevance">Highest relevance</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
