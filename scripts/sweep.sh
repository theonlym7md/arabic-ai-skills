#!/bin/bash
# Arabic UX Microcopy - Sweep Script
# This script is used by AI agents to perform a codebase-wide sweep for "Slop" Arabic words.

echo "🔍 Scanning for 'Slop' Arabic words in .html, .js, .jsx, .ts, .tsx files..."
echo "--------------------------------------------------------"

# Find commonly rejected phrases
echo "❌ Instances of 'قم بـ':"
grep -rn "قم بـ" --include=\*.{html,js,jsx,ts,tsx} . || echo "None found."

echo "❌ Instances of 'تم بنجاح':"
grep -rn "تم بنجاح" --include=\*.{html,js,jsx,ts,tsx} . || echo "None found."

echo "❌ Instances of 'الرجاء':"
grep -rn "الرجاء" --include=\*.{html,js,jsx,ts,tsx} . || echo "None found."

echo "--------------------------------------------------------"
echo "✅ Sweep scan complete. Agent should now process results."
