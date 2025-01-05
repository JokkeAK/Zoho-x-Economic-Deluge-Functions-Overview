string standalone.formatCurrency(Float numberValue)
{
    /*
     * Formats a number into a currency string with thousand separators and two decimal places.
     * Negative numbers are enclosed in parentheses with a minus sign.
     *
     * @param numberValue The number to be formatted.
     * @return A string representing the formatted currency if successful or an error message if not.
     *         - Example Outputs:
     *             - Input: 80613.75 → Output: "80.613,75"
     *             - Input: -388.5 → Output: "(-388,50)"
     *             - Input: 123456 → Output: "123.456,00"
     *             - Input: null → Output: ""
     */
    try {
        // Check if the input number is null
        if (numberValue == null) {
            return "";
        }

        // Convert the input to a decimal
        formattedNumber = toDecimal(numberValue.toString());

        // Convert the decimal to a string
        formattedNumberStr = formattedNumber.toString();

        // Initialize flag for negative numbers
        isNegative = false;

        // Check if the number is negative
        if (formattedNumberStr.startsWith("-")) {
            isNegative = true;
            // Remove the negative sign for further processing
            formattedNumberStr = substring(formattedNumberStr, 1, len(formattedNumberStr));
        }

        // Split into integer and decimal parts using indexOf and substring
        decimalSeparatorIndex = indexOf(formattedNumberStr, ".");
        if (decimalSeparatorIndex != -1) {
            integerPart = substring(formattedNumberStr, 0, decimalSeparatorIndex);
            decimalPart = substring(formattedNumberStr, decimalSeparatorIndex + 1, len(formattedNumberStr));

            // Adjust decimal part to two digits
            if (len(decimalPart) == 1) {
                decimalPart = decimalPart + "0";
            }
            else if (len(decimalPart) > 2) {
                decimalPart = substring(decimalPart, 0, 2);
            }
        }
        else {
            integerPart = formattedNumberStr;
            decimalPart = "00";
        }

        // Insert dots as thousand separators based on integerPart length
        len = length(integerPart);
        if (len <= 3) {
            formattedInteger = integerPart;
        }
        else if (len <= 6) {
            group1 = substring(integerPart, 0, len - 3);
            group2 = substring(integerPart, len - 3, len);
            formattedInteger = group1 + "." + group2;
        }
        else if (len <= 9) {
            group1 = substring(integerPart, 0, len - 6);
            group2 = substring(integerPart, len - 6, len - 3);
            group3 = substring(integerPart, len - 3, len);
            formattedInteger = group1 + "." + group2 + "." + group3;
        }
        else {
            // For numbers longer than 9 digits, handle additional groups
            group1 = substring(integerPart, 0, len - 9);
            group2 = substring(integerPart, len - 9, len - 6);
            group3 = substring(integerPart, len - 6, len - 3);
            group4 = substring(integerPart, len - 3, len);
            formattedInteger = group1 + "." + group2 + "." + group3 + "." + group4;
        }

        // Combine with decimal part using comma
        finalFormattedNumber = formattedInteger + "," + decimalPart;

        // If the number was negative, enclose in parentheses with a minus sign
        if (isNegative) {
            finalFormattedNumber = "(-" + finalFormattedNumber + ")";
        }

        return finalFormattedNumber;
    }
    catch (e) {
        return "Error: Error in standalone.formatCurrency: " + e.toString();
    }
    return "Error: An unexpected error occured in standalone.formatCurrency.";
}
