import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageForm } from "@/components/admin/pages/PageForm";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function EditPagePage({ params }: Props) {
  await requireAdmin();

  const page = await prisma.page.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      status: true,
      template: true,
      metaTitle: true,
      metaDescription: true,
    },
  });

  if (!page) notFound();

  return (
    <div className="p-6">
      <h1 className="font-display font-bold text-2xl text-primary mb-6">Edit Page</h1>
      <PageForm mode="edit" page={page} />
    </div>
  );
}
