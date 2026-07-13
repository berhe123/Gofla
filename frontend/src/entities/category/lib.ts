import type { CategoryDto } from '@/shared/types/category';

export function flattenCategories(categories: CategoryDto[]): CategoryDto[] {
  return categories.flatMap((category) => [
    category,
    ...(category.children?.length ? flattenCategories(category.children) : []),
  ]);
}
