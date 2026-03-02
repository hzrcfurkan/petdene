"use client"

import { yupResolver } from "@hookform/resolvers/yup"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as yup from "yup"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FormData {
	name: string
	email: string
	phone: string
	password: string
}

const schema = yup.object({
	name: yup.string().required("Ad soyad zorunludur"),
	email: yup.string().email("Geçersiz e-posta").required("E-posta zorunludur"),
	phone: yup
		.string()
		.matches(/^\+?[0-9]{7,15}$/, "Geçerli telefon numarası girin")
		.required("Telefon numarası zorunludur"),
	password: yup.string().min(6, "Minimum 6 karakter").required("Şifre zorunludur"),
})

export default function SignupForm() {
	const router = useRouter()
	const [loading, setLoading] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<FormData>({
		resolver: yupResolver(schema),
	})

	const onSubmit = async (data: FormData) => {
		setLoading(true)
		try {
			const res = await fetch("/api/v1/user/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...data, role: "CUSTOMER" }),
			})
			const result = await res.json()

			if (!res.ok) throw new Error(result.error || "Hesap oluşturulamadı")

			toast.success("Account created successfully! Redirecting...")
			reset()
			setTimeout(() => router.push("/signin"), 1200)
		} catch (err: any) {
			toast.error(err.message || "Bir hata oluştu")
		} finally {
			setLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			{(["name", "email", "phone", "password"] as const).map((field) => (
				<div key={field} className="space-y-2">
					<Label htmlFor={field}>
						{field === "name"
							? "Ad Soyad"
							: field === "email"
								? "E-posta"
								: field === "phone"
									? "Telefon Numarası"
									: "Şifre"}
					</Label>
					<Input
						id={field}
						type={
							field === "password"
								? "password"
								: field === "email"
									? "email"
									: "text"
						}
						placeholder={
							field === "name"
								? "Ad Soyad"
								: field === "email"
									? "ornek@eposta.com"
									: field === "phone"
										? "+1 (555) 000-0000"
										: "••••••••"
						}
						{...register(field)}
					/>
					{errors[field] && (
						<p className="text-sm text-destructive">{errors[field]?.message}</p>
					)}
				</div>
			))}

			<Button type="submit" className="w-full" disabled={loading}>
				{loading ? "Creating account..." : "Kayıt Ol"}
			</Button>
		</form>
	)
}
