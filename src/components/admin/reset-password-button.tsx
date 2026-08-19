"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { regenerateResidentPassword } from "@/src/lib/actions/v1/__server__/resident-actions";
import { regenerateDriverPassword } from "@/src/lib/actions/v1/__server__/driver-actions";

const resetActions = {
  resident: regenerateResidentPassword,
  driver: regenerateDriverPassword,
};

export function ResetPasswordButton({
  userId,
  role,
}: {
  userId: string;
  role: "resident" | "driver";
}) {
  const [state, formAction, pending] = useActionState(resetActions[role], null);

  useEffect(() => {
    if (state?.success) {
      const d = state.data;
      toast.success(`${role === "driver" ? "Driver" : "Resident"} password reset`, {
        description: `Phone: ${d.phone ?? "—"}\nNew password: ${d.password}`,
        duration: 20000,
        action: {
          label: "Copy",
          onClick: async () => {
            await navigator.clipboard.writeText(d.password);
            toast.success("Password copied to clipboard");
          },
        },
      });
    } else if (state?.success === false) {
      toast.error(state.error || "Something went wrong");
    }
  }, [state, role]);

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-60"
      >
        {pending ? "Resetting…" : "Reset password"}
      </button>
    </form>
  );
}
