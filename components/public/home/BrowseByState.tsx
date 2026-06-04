import Link from "next/link"
import { prisma } from "@/lib/prisma"

async function getStatesWithCount() {
  const states = await prisma.state.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true, name: true, slug: true, abbreviation: true,
      _count: { select: { companies: { where: { status: "ACTIVE" } } } },
    },
  })
  return states
}

export async function BrowseByState() {
  const states = await getStatesWithCount()

  return (
    <section className="py-20 bg-slate-50">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-3">
            50 States
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-primary mb-3">
            Browse by State
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Find dental billing companies in your state. Click any state to explore local providers.
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
          {states.map((state) => (
            <Link
              key={state.id}
              href={`/directory/${state.slug}`}
              className="group flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-100 hover:border-teal-300 hover:bg-teal-50/50 hover:shadow-sm transition-all duration-150 text-center"
            >
              <span className="font-display font-bold text-base text-primary group-hover:text-teal-700 transition-colors">
                {state.abbreviation}
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight group-hover:text-teal-600">
                {state.name}
              </span>
              {state._count.companies > 0 && (
                <span className="text-[9px] font-semibold text-teal-500 mt-1">
                  {state._count.companies}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
