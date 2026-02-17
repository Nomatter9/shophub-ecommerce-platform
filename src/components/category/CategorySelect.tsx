import * as React from "react";
import { Check, ChevronsUpDown, Layers } from "lucide-react";
import { cn } from "@/lib/data/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function CategorySelect({ categories, value, onSelect, disabled }: any) {
  const [open, setOpen] = React.useState(false);

  const selectedName = categories
    .flatMap((parent: any) => [parent, ...(parent.children || [])])
    .find((cat: any) => cat.id?.toString() === value?.toString())?.name;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className="w-full justify-between bg-slate-900/50 border-white/10 text-white hover:bg-slate-800 hover:text-white"
        >
          {value ? selectedName : "All Categories"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-[#0B1224] border-white/10">
        <Command className="bg-transparent text-white">
          <CommandInput placeholder="Search categories..." className="text-white border-none focus:ring-0" />
          <CommandList className="max-h-[300px] overflow-y-auto custom-scrollbar">
            <CommandEmpty>No category found.</CommandEmpty>
            
            <CommandGroup>
              <CommandItem
                value="all-categories"
                onSelect={() => {
                  onSelect(""); 
                  setOpen(false);
                }}
                className="text-indigo-400 font-medium aria-selected:bg-indigo-600 aria-selected:text-white cursor-pointer"
              >
                <Layers className="mr-2 h-4 w-4" />
                All Categories
                <Check className={cn("ml-auto h-4 w-4", !value ? "opacity-100" : "opacity-0")} />
              </CommandItem>
            </CommandGroup>

            <CommandSeparator className="bg-white/5" />
            
            {categories.map((parent: any) => (
              <CommandGroup key={parent.id} heading={parent.name} className="px-2 text-slate-500">
                <CommandItem
                  value={parent.name}
                  onSelect={() => {
                    onSelect(parent.id.toString());
                    setOpen(false);
                  }}
                  className="text-white aria-selected:bg-indigo-600 cursor-pointer"
                >
                  <Check className={cn("mr-2 h-4 w-4", value?.toString() === parent.id.toString() ? "opacity-100" : "opacity-0")} />
                  {parent.name}
                </CommandItem>

                {parent.children?.map((child: any) => (
                  <CommandItem
                    key={child.id}
                    value={`${parent.name} ${child.name}`}
                    onSelect={() => {
                      onSelect(child.id.toString());
                      setOpen(false);
                    }}
                    className="text-white pl-8 aria-selected:bg-indigo-600 cursor-pointer"
                  >
                    <Check className={cn("mr-2 h-4 w-4", value?.toString() === child.id.toString() ? "opacity-100" : "opacity-0")} />
                    {child.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}