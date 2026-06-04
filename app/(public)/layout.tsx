import { Navbar } from "@/components/public/layout/Navbar"
import { Footer } from "@/components/public/layout/Footer"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
