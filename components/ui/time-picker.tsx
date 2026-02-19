"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface TimePickerProps {
	value?: string // Format: "HH:mm"
	onChange?: (value: string) => void
	placeholder?: string
	disabled?: boolean
	required?: boolean
	className?: string
	id?: string
	inline?: boolean // If true, render inline without Popover (for use inside other Popovers)
}

// Inline time picker component (for use inside other Popovers)
function InlineTimePicker({
	value,
	onChange,
	disabled,
}: {
	value?: string
	onChange?: (value: string) => void
	disabled?: boolean
}) {
	// Parse time value (HH:mm format)
	const [hours, minutes] = value ? value.split(":").map(Number) : [null, null]
	const hourValue = hours !== null ? String(hours).padStart(2, "0") : ""
	const minuteValue = minutes !== null ? String(minutes).padStart(2, "0") : ""

	// Generate hour options (00-23)
	const hourOptions = Array.from({ length: 24 }, (_, i) => {
		const hour = String(i).padStart(2, "0")
		return { value: hour, label: hour }
	})

	// Generate minute options (00-59)
	const minuteOptions = Array.from({ length: 60 }, (_, i) => {
		const minute = String(i).padStart(2, "0")
		return { value: minute, label: minute }
	})

	const handleHourChange = (hour: string) => {
		const newTime = `${hour}:${minuteValue || "00"}`
		onChange?.(newTime)
	}

	const handleMinuteChange = (minute: string) => {
		const newTime = `${hourValue || "00"}:${minute}`
		onChange?.(newTime)
	}

	return (
		<div className="flex items-center gap-2">
			<Select
				value={hourValue}
				onValueChange={handleHourChange}
				disabled={disabled}
			>
				<SelectTrigger className="w-[80px]">
					<SelectValue placeholder="HH" />
				</SelectTrigger>
				<SelectContent>
					{hourOptions.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<span className="text-lg font-semibold">:</span>
			<Select
				value={minuteValue}
				onValueChange={handleMinuteChange}
				disabled={disabled}
			>
				<SelectTrigger className="w-[80px]">
					<SelectValue placeholder="MM" />
				</SelectTrigger>
				<SelectContent>
					{minuteOptions.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}

export function TimePicker({
	value,
	onChange,
	placeholder = "Select time",
	disabled = false,
	required = false,
	className,
	id,
	inline = false,
}: TimePickerProps) {
	const [open, setOpen] = React.useState(false)
	
	// Parse time value (HH:mm format)
	const [hours, minutes] = value ? value.split(":").map(Number) : [null, null]
	const hourValue = hours !== null ? String(hours).padStart(2, "0") : ""
	const minuteValue = minutes !== null ? String(minutes).padStart(2, "0") : ""

	// Generate hour options (00-23)
	const hourOptions = Array.from({ length: 24 }, (_, i) => {
		const hour = String(i).padStart(2, "0")
		return { value: hour, label: hour }
	})

	// Generate minute options (00-59)
	const minuteOptions = Array.from({ length: 60 }, (_, i) => {
		const minute = String(i).padStart(2, "0")
		return { value: minute, label: minute }
	})

	const handleHourChange = (hour: string) => {
		const newTime = `${hour}:${minuteValue || "00"}`
		onChange?.(newTime)
	}

	const handleMinuteChange = (minute: string) => {
		const newTime = `${hourValue || "00"}:${minute}`
		onChange?.(newTime)
	}

	const displayValue = value
		? (() => {
				const [h, m] = value.split(":").map(Number)
				const date = new Date()
				date.setHours(h, m, 0, 0)
				return format(date, "h:mm a")
			})()
		: placeholder

	// If inline, render without Popover
	if (inline) {
		return <InlineTimePicker value={value} onChange={onChange} disabled={disabled} />
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					variant="outline"
					className={cn(
						"w-full justify-start text-left font-normal",
						!value && "text-muted-foreground",
						className
					)}
					disabled={disabled}
				>
					<Clock className="mr-2 h-4 w-4" />
					{displayValue}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-3" align="start">
				<InlineTimePicker value={value} onChange={onChange} disabled={disabled} />
			</PopoverContent>
		</Popover>
	)
}

