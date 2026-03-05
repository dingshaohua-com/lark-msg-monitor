/**
 * 去除对象中的空字段（空字符串、undefined、null）
 * @param obj 需要处理的对象
 * @returns 去除空字段后的新对象
 */
export function removeEmptyFields<T extends Record<string, any>>(obj: T | null | undefined): Partial<T> {
  if (!obj) {
    return {};
  }

  const result: Partial<T> = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== '' && value !== undefined && value !== null) {
      result[key as keyof T] = value;
    }
  });

  return result;
}
