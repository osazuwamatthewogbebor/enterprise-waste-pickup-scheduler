"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { verifyOrganizationAction } from "@/src/lib/actions/v1/__server__/organization-actions";

interface Org {
  id: string;
  name: string;
  slug: string;
  cacNumber: string | null;
  verificationStatus: string;
  residentCount: number;
  createdAt: Date;
}

export function PspTable({ orgs }: { orgs: Org[] }) {
  const [state, formAction, pending] = useActionState(verifyOrganizationAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      toast.success("Organization status updated");
      router.refresh();
    }
    if (state?.success === false) {
      toast.error((state as any).error || "Something went wrong");
    }
  }, [state, router]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Organization</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">CAC</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Residents</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orgs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  No organizations found.
                </td>
              </tr>
            ) : (
              orgs.map((org) => (
                <tr key={org.id} className="border-b border-slate-200">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{org.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{org.slug}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{org.cacNumber ?? "&mdash;"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {org.verificationStatus.replace("_", " ")}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600">{org.residentCount}</td>
                  <td className="px-4 py-3">
                    <form
                      action={formAction}
                      onSubmit={(e) => {
                        if (!confirm("Update this organization's verification status?")) e.preventDefault();
                      }}
                    >
                      <input type="hidden" name="orgId" value={org.id} />
                      <select
                        name="status"
                        defaultValue={org.verificationStatus}
                        disabled={pending}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="PENDING_VERIFICATION">Pending verification</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="SUSPENDED">Suspended</option>
                      </select>
                      <button
                        type="submit"
                        disabled={pending}
                        className="ml-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Update
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
