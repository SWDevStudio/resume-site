const MAX_COLUMNS = 4;
const MAX_MIDDLE = 3;

export function gridColumns(count: number, name: string) {
  const total = Math.max(count, 1);
  const even = total % 2 === 0;
  const rows = Math.ceil(total / MAX_COLUMNS);
  return {
    [`--${name}-columns-sm`]: String(even ? 2 : 1),
    [`--${name}-columns-md`]: String(even ? 2 : Math.min(total, MAX_MIDDLE)),
    [`--${name}-columns`]: String(Math.ceil(total / rows)),
  };
}
