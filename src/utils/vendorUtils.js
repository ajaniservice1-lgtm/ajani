export const generateSlug = (name, area) => {
  if (!name) return "unnamed";
  const slugifiedName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const slugifiedArea = area
    ? area.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    : "";
  return slugifiedArea ? `${slugifiedName}-in-${slugifiedArea}` : slugifiedName;
};
