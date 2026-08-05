import { trpc } from "@/lib/trpc";
import { useCallback } from "react";

export function useAuth() {
  const { data: user, isLoading: loading, error, refetch } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (e) {
      console.error("Logout failed", e);
    }
  }, [logoutMutation]);

  return {
    user: user ?? null,
    loading,
    error: error ?? null,
    isAuthenticated: Boolean(user),
    logout,
  };
}
