import { formatTitle } from "../utils/formatTitle";

export interface BlogPost {
	title: string;
	category: string;
	date: string;
	slug: string;
	readme: string;
	description?: string; // Optional description for blog posts
}

// Sample base64 encoded "Hello World" Markdown: "IyBIZWxsbyBXb3JsZAoKYmxvZyBjb250ZW50"
export const allBlogPosts: BlogPost[] = [
	{
		title: formatTitle("Understanding Modern Web Architecture"),
		category: "Technical",
		date: "2024-03-15",
		slug: "understanding-modern-web-architecture",
		readme:
			"IyBVbmRlcnN0YW5kaW5nIE1vZGVybiBXZWIgQXJjaGl0ZWN0dXJlCgpTb21lIGRldGFpbGVkIGNvbnRlbnQgYWJvdXQgbW9kZXJuIHdlYiBhcmNoaXRlY3R1cmUuLi4=", // Example base64
		description: "A deep dive into modern web architecture patterns and practices.",
	},
	{
		title: formatTitle("The Future of Open Source"),
		category: "Community",
		date: "2024-03-10",
		slug: "future-of-open-source",
		readme:
			"IyBUaGUgRnV0dXJlIG9mIE9wZW4gU291cmNlCgpFeHBsb3JpbmcgdGhlIHRyZW5kcyBhbmQgaW1wbGljYXRpb25zIGZvciBvcGVuIHNvdXJjZS4uLg==", // Example base64
		description: "Exploring the trends and implications for the future of open source software.",
	},
];
