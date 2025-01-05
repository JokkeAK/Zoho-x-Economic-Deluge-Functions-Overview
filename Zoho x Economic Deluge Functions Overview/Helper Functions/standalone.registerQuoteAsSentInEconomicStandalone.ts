string standalone.registerQuoteAsSentInEconomicStandalone(String quoteId)
{
    /*
     * Registers a quote as "Sent" in E-conomic if it's not already sent.
     *
     * @param quoteId The ID of the quote record in Zoho CRM.
     * @return A string indicating the success or failure of the registration process.
     */
    try {
        // Retrieve E-conomic API tokens and set up HTTP headers
        headersMap = standalone.setUpApiHeaders();
        if (headersMap == "") {
            // Tokens not found; exit the function to prevent further errors
            info "Exit at step 1: Failed to retrieve API tokens.";
            return "Error: Failed to retrieve API tokens.";
        }

        // Fetch quote details from Zoho CRM
        quoteDetails = zoho.crm.getRecordById("Visiana_Quotes", quoteId);
        if (quoteDetails == null) {
            info "Exit at step 2: Quote record not found.";
            return "Error: Quote record not found";
        }

        // Retrieve the quote stage and quote number
        quoteStage = quoteDetails.get("Quote_Stage");
        info "Quote stage: " + quoteStage;
        if (quoteStage == null || quoteStage == "") {
            info "Exit at step 2.1: Quote stage not found in the quote.";
            return "Error: Quote stage not found in the quote";
        }

        quoteNumber = quoteDetails.get("Quote_Number");
        info "Quote number: " + quoteNumber;
        if (quoteNumber == null || quoteNumber == "") {
            info "Exit at step 2.1: Quote number not found in the quote.";
            return "Error: Quote number not found in the quote";
        }

        // Verify that the quote number is not already registered as "Sent" in E-conomic
        apiUrlIsQuoteSent = "https://restapi.e-conomic.com/quotes/sent/" + quoteNumber;
        sentVerifyResponse = standalone.makeApiRequest(apiUrlIsQuoteSent, "GET", headersMap, "");

        // Check the HTTP status code to see if the quote is already registered as 'Sent' in E-conomic
        httpStatusCode = sentVerifyResponse.get("httpStatusCode");
        if (standalone.handleHttpStatusCode(httpStatusCode, "Verifying the quote as 'Sent' in E-conomic", sentVerifyResponse) == "true") {
            return "Error: Quote is already registered as 'Sent' in E-conomic." + sentVerifyResponse;
        }

        // If the quote stage is "Sent" in Zoho, make the POST request with just the quote number 
        if (quoteStage == "Sent") {
            // Prepare quote data
            quoteData = { "quoteNumber": quoteNumber };

            // Register the quote in E-conomic as "Sent"
            apiUrlQuote = "https://restapi.e-conomic.com/quotes/sent";
            sentResponse = standalone.makeApiRequest(apiUrlQuote, "POST", headersMap, quoteData);

            // Check the HTTP status code
            httpStatusCode = sentResponse.get("httpStatusCode");
            if (standalone.handleHttpStatusCode(httpStatusCode, "Registering quote as 'Sent' in E-conomic", sentResponse) == "false") {
                // If handling the status code returns false, exit the function
                info "Exit at step 4: POST request failed.";
                return "Error: POST request failed. " + sentResponse;
            }
            else {
                return "Successfully registered the quote in E-conomic as 'Sent'.";
            }
        }
        else {
            info "The quote stage is not 'Sent'.";
            return "Error: The quote stage is not 'Sent'.";
        }
    }
    catch (e) {
        info "Error in registerQuoteAsSentInEconomic: " + e.toString();
        return "Error in registerQuoteAsSentInEconomic";
    }
    return "Error: Unexpected error occured in registerQuoteAsSentInEconomicStandalone.";
}
