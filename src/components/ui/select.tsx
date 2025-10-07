import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

// Extra trigger props allowing optional or custom icon
interface SelectTriggerExtraProps {
	/** Hide the dropdown icon entirely */
	hideIcon?: boolean;
	/** Provide a custom icon node; ignored if hideIcon is true */
	icon?: React.ReactNode;
	/** Extra class names applied to the default ChevronDown icon */
	iconClassName?: string;
}

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> &
		SelectTriggerExtraProps
>(({ className, children, hideIcon, icon, iconClassName, ...props }, ref) => (
	<SelectPrimitive.Trigger
		ref={ref}
		className={cn(
			"flex h-9 w-full items-center justify-between whitespace-nowrap px-3 py-2 text-sm [&>span]:line-clamp-1 transition-colors",
			"rounded-lg border border-gray-200 dark:border-gray-700 cream:border-[var(--accent-color)]",
			"bg-white dark:bg-gray-900 cream:bg-[var(--primary-color)] text-gray-900 dark:text-white cream:text-[var(--text-color)]",
			"data-[placeholder]:text-gray-400 dark:data-[placeholder]:text-gray-500",
			"hover:bg-gray-50 dark:hover:bg-gray-800 cream:hover:bg-[var(--accent-color-hover)] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 cream:focus:ring-[var(--accent-color)]",
			"disabled:cursor-not-allowed disabled:opacity-50 shadow-sm",
			className
		)}
		{...props}
	>
		{children}
		{!hideIcon && (
			<SelectPrimitive.Icon asChild>
				{icon || (
					<ChevronDown className={cn("h-4 w-4 opacity-60", iconClassName)} />
				)}
			</SelectPrimitive.Icon>
		)}
	</SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
	<SelectPrimitive.ScrollUpButton
		ref={ref}
		className={cn(
			"flex cursor-default items-center justify-center py-1",
			className
		)}
		{...props}
	>
		<ChevronUp className="h-4 w-4" />
	</SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
	<SelectPrimitive.ScrollDownButton
		ref={ref}
		className={cn(
			"flex cursor-default items-center justify-center py-1",
			className
		)}
		{...props}
	>
		<ChevronDown className="h-4 w-4" />
	</SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
	SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
	<SelectPrimitive.Portal>
		<SelectPrimitive.Content
			ref={ref}
			className={cn(
				// Positioning & animation
				"relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden origin-[--radix-select-content-transform-origin] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
				// Border & background to match panel style
				"rounded-lg border border-gray-200 dark:border-gray-700 cream:border-[var(--accent-color)] bg-white dark:bg-gray-900 cream:bg-[var(--primary-color)] text-gray-900 dark:text-gray-100 cream:text-[var(--text-color)] shadow-lg",
				// Subtle backdrop blending
				"backdrop-blur supports-[backdrop-filter]:bg-white/90 dark:supports-[backdrop-filter]:bg-gray-900/90",
				position === "popper" &&
					"data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
				className
			)}
			position={position}
			{...props}
		>
			<SelectScrollUpButton />
			<SelectPrimitive.Viewport
				// Allow the menu to grow naturally (no artificial height = no unnecessary scrollbar)
				// Hide scrollbar visually when overflow occurs
				className={cn(
					"p-1 w-full min-w-[var(--radix-select-trigger-width)] max-h-64 overflow-y-auto",
					"[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
				)}
				style={{ scrollbarWidth: "none" }}
			>
				{children}
			</SelectPrimitive.Viewport>
			<SelectScrollDownButton />
		</SelectPrimitive.Content>
	</SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
	<SelectPrimitive.Label
		ref={ref}
		className={cn("px-2 py-1.5 text-sm font-semibold", className)}
		{...props}
	/>
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
	<SelectPrimitive.Item
		ref={ref}
		className={cn(
			"relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pl-2 pr-8 text-sm outline-none",
			// Default colors
			"text-gray-700 dark:text-gray-200 cream:text-[var(--text-color)]",
			// Hover & focus styles blending with site palette
			"hover:bg-gray-100 dark:hover:bg-gray-800 cream:hover:bg-[var(--accent-color-hover)]",
			"focus:bg-orange-500 focus:text-white dark:focus:bg-orange-600",
			// Checked state (selected item)
			"data-[state=checked]:bg-orange-500 data-[state=checked]:text-white dark:data-[state=checked]:bg-orange-600",
			// Disabled state
			"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
			className
		)}
		{...props}
	>
		<span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
			<SelectPrimitive.ItemIndicator>
				<Check className="h-4 w-4" />
			</SelectPrimitive.ItemIndicator>
		</span>
		<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
	</SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
	<SelectPrimitive.Separator
		ref={ref}
		className={cn("-mx-1 my-1 h-px bg-muted", className)}
		{...props}
	/>
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
	Select,
	SelectGroup,
	SelectValue,
	SelectTrigger,
	SelectContent,
	SelectLabel,
	SelectItem,
	SelectSeparator,
	SelectScrollUpButton,
	SelectScrollDownButton,
};
