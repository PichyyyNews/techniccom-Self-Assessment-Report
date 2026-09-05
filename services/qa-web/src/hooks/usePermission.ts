"use client";

import { useSession } from "next-auth/react";
import { useCallback, useMemo } from "react";

/**
 * Hook to check current user permissions against the Action-based Permission Matrix
 */
export function usePermission() {
  const { data: session, status } = useSession();

  const isRoot = session?.user?.role === "ROOT";
  const permissions: string[] = useMemo(() => {
    return (session?.user as any)?.permissions || ["/dashboard"];
  }, [session]);

  const hasPermission = useCallback(
    (permKey: string): boolean => {
      if (isRoot) return true;
      return permissions.includes(permKey);
    },
    [isRoot, permissions]
  );

  const hasAnyPermission = useCallback(
    (permKeys: string[]): boolean => {
      if (isRoot) return true;
      return permKeys.some((k) => permissions.includes(k));
    },
    [isRoot, permissions]
  );

  const hasAllPermissions = useCallback(
    (permKeys: string[]): boolean => {
      if (isRoot) return true;
      return permKeys.every((k) => permissions.includes(k));
    },
    [isRoot, permissions]
  );

  return {
    isRoot,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading: status === "loading",
  };
}
