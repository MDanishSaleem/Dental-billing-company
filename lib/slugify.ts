export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function stateSlug(stateName: string): string {
  return createSlug(stateName);
}

export function citySlug(cityName: string): string {
  return createSlug(cityName);
}

export function companySlug(companyName: string): string {
  return createSlug(companyName);
}
