export const DEFAULT_COLLIDER_PREFIX = "COLLIDER_";

export type WorldNodeKind = "collider" | "visible";

export function isColliderNodeName(
  name: string,
  prefix = DEFAULT_COLLIDER_PREFIX,
) {
  return name.trim().toUpperCase().startsWith(prefix.toUpperCase());
}

export function classifyWorldNode(
  name: string,
  prefix = DEFAULT_COLLIDER_PREFIX,
): WorldNodeKind {
  return isColliderNodeName(name, prefix) ? "collider" : "visible";
}

export function splitWorldNodeNames(
  names: readonly string[],
  prefix = DEFAULT_COLLIDER_PREFIX,
) {
  return names.reduce(
    (groups, name) => {
      groups[classifyWorldNode(name, prefix)].push(name);
      return groups;
    },
    { collider: [] as string[], visible: [] as string[] },
  );
}
