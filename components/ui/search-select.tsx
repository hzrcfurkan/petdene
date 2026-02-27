"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"

export interface SearchSelectOption {
	value: string
	label: string
	subLabel?: string
}

interface SearchSelectProps {
	options: SearchSelectOption[]
	value?: string
	onValueChange: (value: string) => void
	placeholder?: string
	searchPlaceholder?: string
	emptyText?: string
	disabled?: boolean
	className?: string
	renderOption?: (option: SearchSelectOption) => React.ReactNode
	/** When true, search is passed to parent for async loading - options may update on search */
	onSearchChange?: (search: string) => void
	loading?: boolean
}

export function SearchSelect({
	options,
	value,
	onValueChange,
	placeholder = "Select...",
	searchPlaceholder = "Search...",
	emptyText = "No results found.",
	disabled = false,
	className,
	renderOption,
	onSearchChange,
	loading = false,
}: SearchSelectProps) {
	const [open, setOpen] = React.useState(false)
	const [search, setSearch] = React.useState("")

	React.useEffect(() => {
		if (onSearchChange) {
			const t = setTimeout(() => onSearchChange(search), 300)
			return () => clearTimeout(t)
		}
	}, [search, onSearchChange])

	// Reset search when popover closes
	React.useEffect(() => {
		if (!open) setSearch("")
	}, [open])

	const selectedOption = options.find((opt) => opt.value === value)

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					disabled={disabled}
					className={cn("w-full justify-between font-normal", className)}
				>
					<span className="truncate">
						{selectedOption ? (
							renderOption ? (
								renderOption(selectedOption)
							) : (
								<>
									{selectedOption.label}
									{selectedOption.subLabel && (
										<span className="ml-2 text-muted-foreground text-sm">
											{selectedOption.subLabel}
										</span>
									)}
								</>
							)
						) : (
							<span className="text-muted-foreground">{placeholder}</span>
						)}
					</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
				<Command shouldFilter={!onSearchChange}>
					<CommandInput
						placeholder={searchPlaceholder}
						value={search}
						onValueChange={setSearch}
					/>
					<CommandList>
						<CommandEmpty>{loading ? "Loading..." : emptyText}</CommandEmpty>
						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									key={option.value}
									value={`${option.label} ${option.subLabel || ""}`}
									onSelect={() => {
										onValueChange(option.value)
										setOpen(false)
									}}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											value === option.value ? "opacity-100" : "opacity-0"
										)}
									/>
									{renderOption ? (
										renderOption(option)
									) : (
										<div className="flex flex-col">
											<span>{option.label}</span>
											{option.subLabel && (
												<span className="text-xs text-muted-foreground">
													{option.subLabel}
												</span>
											)}
										</div>
									)}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
