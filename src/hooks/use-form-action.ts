"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ActionFn = (_prevState: unknown, _formData: FormData) => Promise<any>;

export function useFormAction<TData>(
  action: ActionFn,
  options?: { onSuccess?: (data: TData) => void; refreshAfter?: boolean }
) {
  const [state, formAction, pending] = useActionState(action, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      if (state.data !== undefined) {
        options?.onSuccess?.(state.data as TData);
      }
      if (options?.refreshAfter !== false) {
        router.refresh();
      }
    }
    if (state?.success === false) {
      toast.error(state.error || "Something went wrong");
    }
  }, [state, router, options]);

  return { state, formAction, pending };
}
