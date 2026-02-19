"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { TimePicker } from "@/components/ui/time-picker"
import { cn } from "@/lib/utils"

interface DateTimePickerProps {
	value?: string
	onChange?: (value: string) => void
	placeholder?: string
	disabled?: boolean
	required?: boolean
	min?: string
	max?: string
	className?: string
	id?: string
}

export function DateTimePicker({
	value,
	onChange,
	placeholder = "Pick a date and time",
	disabled = false,
	required = false,
	min,
	max,
	className,
	id,
}: DateTimePickerProps) {
	const [open, setOpen] = React.useState(false)
	
	// Parse the datetime-local value
	const date = value ? new Date(value) : undefined
	const timeValue = date ? format(date, "HH:mm") : ""

	const handleDateSelect = (selectedDate: Date | undefined) => {
		if (selectedDate) {
			// Combine selected date with current time value
			const [hours, minutes] = timeValue ? timeValue.split(":").map(Number) : [0, 0]
			const combinedDate = new Date(selectedDate)
			combinedDate.setHours(hours, minutes, 0, 0)
			
			// Format as datetime-local string (YYYY-MM-DDTHH:mm)
			const formattedDateTime = format(combinedDate, "yyyy-MM-dd'T'HH:mm")
			onChange?.(formattedDateTime)
		} else {
			onChange?.("")
		}
	}

	const handleTimeChange = (time: string) => {
		if (date) {
			const [hours, minutes] = time.split(":").map(Number)
			const combinedDate = new Date(date)
			combinedDate.setHours(hours, minutes, 0, 0)
			
			// Format as datetime-local string
			const formattedDateTime = format(combinedDate, "yyyy-MM-dd'T'HH:mm")
			onChange?.(formattedDateTime)
		} else if (time) {
			// If no date is selected, use today's date with the selected time
			const today = new Date()
			const [hours, minutes] = time.split(":").map(Number)
			today.setHours(hours, minutes, 0, 0)
			const formattedDateTime = format(today, "yyyy-MM-dd'T'HH:mm")
			onChange?.(formattedDateTime)
		}
	}

	const minDate = min ? new Date(min) : undefined
	const maxDate = max ? new Date(max) : undefined

	return (
		<div className="space-y-2">
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
						{date ? (
							<span>
								{format(date, "PPP")} {timeValue && `at ${format(new Date(`2000-01-01T${timeValue}`), "h:mm a")}`}
							</span>
						) : (
							<span>{placeholder}</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<div className="p-3 space-y-3">
						<Calendar
							mode="single"
							selected={date}
							onSelect={handleDateSelect}
							disabled={disabled}
							required={required}
							initialFocus
							{...(minDate && { fromDate: minDate })}
							{...(maxDate && { toDate: maxDate })}
						/>
						<div className="border-t pt-3">
							<Label className="text-xs text-muted-foreground mb-2 block">
								Time
							</Label>
							<TimePicker
								value={timeValue}
								onChange={handleTimeChange}
								placeholder="Select time"
								disabled={disabled}
								inline={true}
							/>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	)
}

