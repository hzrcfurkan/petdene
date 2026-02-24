"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
	value?: string
	onChange?: (value: string) => void
	placeholder?: string
	disabled?: boolean
	required?: boolean
	min?: Date
	max?: Date
	className?: string
	id?: string
}

export function DatePicker({
	value,
	onChange,
	placeholder = "Pick a date",
	disabled = false,
	required = false,
	min,
	max,
	className,
	id,
}: DatePickerProps) {
	const [open, setOpen] = React.useState(false)
	const date = value ? new Date(value) : undefined

	const handleSelect = (selectedDate: Date | undefined) => {
		if (selectedDate) {
			const formattedDate = format(selectedDate, "yyyy-MM-dd")
			onChange?.(formattedDate)
			setOpen(false)
		} else {
			onChange?.("")
		}
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					variant="outline"
					className={cn(
						"w-full justify-start text-left font-normal",
						!date && "text-muted-foreground",
						className
					)}
					disabled={disabled}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{date ? format(date, "PPP") : <span>{placeholder}</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={date}
					onSelect={handleSelect}
					disabled={disabled}
					required={required}
					initialFocus
					{...(min && { fromDate: min })}
					{...(max && { toDate: max })}
				/>
			</PopoverContent>
		</Popover>
	)
}

