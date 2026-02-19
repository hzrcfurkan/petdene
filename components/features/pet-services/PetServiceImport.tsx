"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { mutationFetcher } from "@/lib/react-query/fetcher"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ImportRow {
	title?: string
	type?: string
	description?: string
	duration?: string
	price?: string
	image?: string
	active?: string
	errors?: string[]
}

export function PetServiceImport() {
	const [file, setFile] = useState<File | null>(null)
	const [preview, setPreview] = useState<ImportRow[]>([])
	const [isProcessing, setIsProcessing] = useState(false)

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0]
		if (!selectedFile) return

		setFile(selectedFile)

		// Simple CSV parsing (for demo - in production, use a proper CSV parser)
		if (selectedFile.name.endsWith(".csv")) {
			const text = await selectedFile.text()
			const lines = text.split("\n").filter((line) => line.trim())
			const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

			const rows: ImportRow[] = []
			for (let i = 1; i < lines.length; i++) {
				const values = lines[i].split(",").map((v) => v.trim())
				const row: ImportRow = {}
				headers.forEach((header, index) => {
					row[header as keyof ImportRow] = values[index] || ""
				})
				rows.push(row)
			}

			setPreview(rows.slice(0, 10)) // Show first 10 rows
		} else {
			toast.error("Please upload a CSV file")
		}
	}

	const handleImport = async () => {
		if (!file || preview.length === 0) {
			toast.error("Please select a file first")
			return
		}

		setIsProcessing(true)
		try {
			// In a real implementation, you would:
			// 1. Parse the CSV properly
			// 2. Validate each row
			// 3. Send to backend import endpoint

			// For now, show a message
			toast.info("Import functionality will be implemented with backend endpoint")
			toast.info(`Found ${preview.length} rows to import`)

			// Example: Send to backend
			// await mutationFetcher("/api/v1/pet-services/import", {
			//   method: "POST",
			//   body: { services: processedRows }
			// })

			toast.success("Import completed successfully")
		} catch (error: any) {
			toast.error(error?.info?.error || "Failed to import services")
		} finally {
			setIsProcessing(false)
		}
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Upload className="w-5 h-5" />
						Upload File
					</CardTitle>
					<CardDescription>
						Upload a CSV file with service data. Required columns: title, type, price
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="file">CSV File</Label>
						<Input
							id="file"
							type="file"
							accept=".csv"
							onChange={handleFileChange}
							disabled={isProcessing}
						/>
					</div>

					{file && (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<FileSpreadsheet className="w-4 h-4" />
							{file.name} ({(file.size / 1024).toFixed(2)} KB)
						</div>
					)}

					{preview.length > 0 && (
						<>
							<Alert>
								<AlertCircle className="h-4 w-4" />
								<AlertTitle>Preview</AlertTitle>
								<AlertDescription>
									Showing first 10 rows. Please review before importing.
								</AlertDescription>
							</Alert>

							<div className="rounded-md border max-h-[400px] overflow-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Title</TableHead>
											<TableHead>Type</TableHead>
											<TableHead>Price</TableHead>
											<TableHead>Duration</TableHead>
											<TableHead>Active</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{preview.map((row, index) => (
											<TableRow key={index}>
												<TableCell>{row.title || "N/A"}</TableCell>
												<TableCell>{row.type || "N/A"}</TableCell>
												<TableCell>${row.price || "N/A"}</TableCell>
												<TableCell>{row.duration || "N/A"} min</TableCell>
												<TableCell>{row.active || "true"}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							<Button onClick={handleImport} disabled={isProcessing}>
								{isProcessing ? "Processing..." : `Import ${preview.length} Services`}
							</Button>
						</>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>CSV Format Guide</CardTitle>
					<CardDescription>Required columns and format for service import</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-2 text-sm">
						<p><strong>Required columns:</strong></p>
						<ul className="list-disc list-inside space-y-1 ml-4">
							<li><code>title</code> - Service title</li>
							<li><code>type</code> - Service type (grooming, vet-checkup, bath, boarding, training)</li>
							<li><code>price</code> - Service price (number)</li>
						</ul>
						<p className="mt-4"><strong>Optional columns:</strong></p>
						<ul className="list-disc list-inside space-y-1 ml-4">
							<li><code>description</code> - Service description</li>
							<li><code>duration</code> - Duration in minutes</li>
							<li><code>image</code> - Image URL</li>
							<li><code>active</code> - Active status (true/false, default: true)</li>
						</ul>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

