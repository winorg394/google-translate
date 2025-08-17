package main

import (
	"fmt"
	"strings"
)

// cleanTextForTranslation removes markdown formatting and normalizes whitespace
func cleanTextForTranslation(text string) string {
	// Remove markdown formatting
	text = strings.ReplaceAll(text, "**", "")  // Remove bold markdown
	text = strings.ReplaceAll(text, "*", "")   // Remove italic markdown
	text = strings.ReplaceAll(text, "`", "")   // Remove code markdown
	text = strings.ReplaceAll(text, "~~", "")  // Remove strikethrough markdown
	
	// Remove special quotes and replace with standard ones
	text = strings.ReplaceAll(text, "\u201C", "\"")  // Left double quotation mark
	text = strings.ReplaceAll(text, "\u201D", "\"")  // Right double quotation mark
	text = strings.ReplaceAll(text, "\u2018", "'")   // Left single quotation mark
	text = strings.ReplaceAll(text, "\u2019", "'")   // Right single quotation mark
	
	// Normalize whitespace: replace multiple spaces/tabs with single space
	text = strings.Join(strings.Fields(text), " ")
	
	// Trim leading/trailing whitespace
	text = strings.TrimSpace(text)
	
	return text
}

func main() {
	fmt.Println("Testing text cleaning function...")
	fmt.Println("=================================")
	
	testCases := []struct {
		name        string
		text        string
		description string
	}{
		{
			name:        "Markdown formatting",
			text:        "This is **bold** and *italic* text with `code` and ~~strikethrough~~",
			description: "Text with markdown formatting",
		},
		{
			name:        "Special quotes",
			text:        "Text with \u201Csmart quotes\u201D and \u2018curly apostrophes\u2019",
			description: "Text with special quote characters",
		},
		{
			name:        "Multiple newlines and spaces",
			text:        "Text with\n\nmultiple\n\nnewlines\n\nand    multiple    spaces",
			description: "Text with excessive whitespace and newlines",
		},
		{
			name:        "Mixed problematic content",
			text:        "**Bold text** with \u201Cquotes\u201D and\n\nnewlines\n\nand    spaces",
			description: "Combination of all problematic elements",
		},
	}
	
	for _, testCase := range testCases {
		fmt.Printf("\nTest: %s\n", testCase.name)
		fmt.Printf("Description: %s\n", testCase.description)
		fmt.Printf("Original text: %q\n", testCase.text)
		
		// Test the cleaning function
		cleaned := cleanTextForTranslation(testCase.text)
		fmt.Printf("Cleaned text: %q\n", cleaned)
		fmt.Println("---")
	}
}
