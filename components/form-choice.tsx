'use client';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
export function Choice({
  name,
  title,
  items,
  initial,
  value,
  onValueChange,
}: {
  name: string;
  title: string;
  items: { value: string; label: string }[];
  initial?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <label className="field" htmlFor={name}>
      {title}
      <Select
        name={name}
        items={items}
        required
        {...(value === undefined
          ? { defaultValue: initial || items[0]?.value }
          : { value })}
        onValueChange={(v) => {
          if (v !== null) onValueChange?.(String(v));
        }}
      >
        <SelectTrigger className="w-full" id={name}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
