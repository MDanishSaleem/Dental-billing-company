import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { StateActiveToggle } from "@/components/admin/states/StateActiveToggle";
import { CityActiveToggle } from "@/components/admin/states/CityActiveToggle";
import { MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminStatesPage() {
  await requireAdmin();

  const states = await prisma.state.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { companies: true },
      },
      cities: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          isActive: true,
          _count: {
            select: { companies: true },
          },
        },
      },
    },
  });

  return (
    <div className="p-6 space-y-8">
      <h1 className="font-display font-bold text-2xl text-primary">States &amp; Cities</h1>

      {/* States Table */}
      <section>
        <h2 className="text-lg font-semibold text-slate-700 mb-3">States</h2>
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {states.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MapPin className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-slate-500 font-medium">No states found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                      Abbr.
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                      Companies
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                      Cities
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {states.map((state) => (
                    <tr
                      key={state.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">{state.name}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                        {state.abbreviation}
                      </td>
                      <td className="px-4 py-3">
                        <StateActiveToggle id={state.id} isActive={state.isActive} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {state._count.companies.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {state.cities.length.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Cities Section - collapsible per state */}
      <section>
        <h2 className="text-lg font-semibold text-slate-700 mb-3">Cities</h2>
        <div className="space-y-3">
          {states.map((state) => (
            <details key={state.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors select-none">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{state.name}</span>
                  <span className="text-xs text-slate-400 font-mono">{state.abbreviation}</span>
                </div>
                <span className="text-xs text-slate-400">
                  {state.cities.length} cities
                </span>
              </summary>

              {state.cities.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400 border-t border-slate-100">
                  No cities in this state.
                </div>
              ) : (
                <div className="border-t border-slate-100 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left px-4 py-2 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                          City
                        </th>
                        <th className="text-left px-4 py-2 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                          Status
                        </th>
                        <th className="text-left px-4 py-2 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                          Companies
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.cities.map((city) => (
                        <tr
                          key={city.id}
                          className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-4 py-2.5 font-medium text-slate-700">{city.name}</td>
                          <td className="px-4 py-2.5">
                            <CityActiveToggle id={city.id} isActive={city.isActive} />
                          </td>
                          <td className="px-4 py-2.5 text-xs text-slate-500">
                            {city._count.companies.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
