import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, Database } from "lucide-react";
import {
  EMISSION_FACTORS,
  EF_CATEGORIES,
  EmissionFactor,
  factorUnitLabel,
} from "./emissionFactors";
import { cn } from "@/lib/utils";

interface Props {
  /** currently selected factor id, if any */
  value?: string;
  onSelect: (factor: EmissionFactor) => void;
}

export default function EmissionFactorPicker({ value, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const selected = EMISSION_FACTORS.find((f) => f.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="flex items-center gap-2 truncate">
            <Database className="h-4 w-4 shrink-0 text-muted-foreground" />
            {selected ? (
              <span className="truncate">{selected.name}</span>
            ) : (
              <span className="text-muted-foreground">Choose from factor library…</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command
          filter={(itemValue, search) =>
            itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandInput placeholder="Search factors (e.g. steel, electricity, freight)…" />
          <CommandList className="max-h-72">
            <CommandEmpty>No matching emission factor.</CommandEmpty>
            {EF_CATEGORIES.map((cat) => {
              const items = EMISSION_FACTORS.filter((f) => f.category === cat);
              if (!items.length) return null;
              return (
                <CommandGroup key={cat} heading={cat}>
                  {items.map((f) => (
                    <CommandItem
                      key={f.id}
                      // searchable text: name + category + source + region
                      value={`${f.name} ${f.category} ${f.source} ${f.region}`}
                      onSelect={() => {
                        onSelect(f);
                        setOpen(false);
                      }}
                      className="flex items-start gap-2"
                    >
                      <Check
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          value === f.id ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm">{f.name}</span>
                          <span className="shrink-0 text-xs font-semibold tabular-nums">
                            {f.value} <span className="font-normal text-muted-foreground">{factorUnitLabel(f)}</span>
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                            {f.source} {f.year}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{f.region}</span>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
