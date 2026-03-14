import { redirect } from "next/navigation"

// Geriye dönük uyumluluk: /staff artık /nurse'e yönleniyor
export default async function StaffPage() {
	redirect("/nurse")
}
