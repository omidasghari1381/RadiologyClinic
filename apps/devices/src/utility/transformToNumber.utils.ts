export function transformQueryToNumbers<T extends Record<string, any>>(
  query: T,
  numberFields: string[],
): T {
  const result: Record<string, any> = { ...query };
  for (const field of numberFields) {
    if (
      result[field] !== undefined &&
      result[field] !== null &&
      result[field] !== ''
    ) {
      const num = Number(result[field]);
      if (!isNaN(num)) {
        result[field] = num;
      }
    }
  }
  return result as T;
}
