#!/usr/bin/env python3
"""
Test script for the Transflow API with problematic texts
"""

import json
import requests

# Test cases with problematic texts
test_cases = [
    {
        "name": "Markdown formatting",
        "text": "This is **bold** and *italic* text with `code` and ~~strikethrough~~",
        "description": "Text with markdown formatting"
    },
    {
        "name": "Special quotes",
        "text": "Text with "smart quotes" and 'curly apostrophes'",
        "description": "Text with special quote characters"
    },
    {
        "name": "Multiple newlines and spaces",
        "text": "Text with\n\nmultiple\n\nnewlines\n\nand    multiple    spaces",
        "description": "Text with excessive whitespace and newlines"
    },
    {
        "name": "Mixed problematic content",
        "text": "**Bold text** with "quotes" and\n\nnewlines\n\nand    spaces",
        "description": "Combination of all problematic elements"
    }
]

def test_api_with_problematic_texts():
    """Test the API with various problematic texts"""
    
    print("Testing Transflow API with problematic texts...")
    print("=" * 60)
    
    api_url = "http://localhost:8080/translate"
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}. Test: {test_case['name']}")
        print(f"   Description: {test_case['description']}")
        print(f"   Original text: {repr(test_case['text'])}")
        
        # Prepare the request
        payload = {
            "text": test_case['text'],
            "to": "fr"  # Translate to French
        }
        
        try:
            # Send POST request
            response = requests.post(
                api_url,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            print(f"   Status code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ Success! Translated text: {result.get('translatedText', 'N/A')}")
            else:
                print(f"   ❌ Error: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("   ❌ Connection error: Make sure the API is running on localhost:8080")
        except requests.exceptions.Timeout:
            print("   ❌ Timeout: Request took too long")
        except Exception as e:
            print(f"   ❌ Unexpected error: {e}")
        
        print("   " + "-" * 50)

def test_json_validation():
    """Test JSON validation with malformed payloads"""
    
    print("\n\nTesting JSON validation...")
    print("=" * 40)
    
    api_url = "http://localhost:8080/translate"
    
    # Test cases with malformed JSON
    malformed_tests = [
        {
            "name": "Text with unescaped newlines",
            "payload": '{"text": "Hello\nWorld", "to": "fr"}',
            "expected_error": "Invalid request payload"
        },
        {
            "name": "Text with special quotes",
            "payload": '{"text": "Hello "World"", "to": "fr"}',
            "expected_error": "Invalid request payload"
        },
        {
            "name": "Text with markdown",
            "payload": '{"text": "**Hello** World", "to": "fr"}',
            "expected_error": "Invalid request payload"
        }
    ]
    
    for test in malformed_tests:
        print(f"\nTest: {test['name']}")
        print(f"Payload: {test['payload']}")
        
        try:
            response = requests.post(
                api_url,
                data=test['payload'],
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
            
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    print("Transflow API Test Suite")
    print("=" * 30)
    
    # Test with problematic texts
    test_api_with_problematic_texts()
    
    # Test JSON validation
    test_json_validation()
    
    print("\n" + "=" * 60)
    print("Test suite completed!")
