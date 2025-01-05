void automation.registerQuoteAsSentInEconomic(String quoteId)
{
    /*
     * Registers a quote as "Sent" in E-conomic based on the quote details from Zoho CRM.
     *
     * @param quoteId The ID of the quote record in Zoho CRM.
     */
    try {
        // Retrieve E-conomic API tokens and set up HTTP headers
        headersMap = standalone.setUpApiHeaders();
        if (headersMap == "") {
            // Tokens not found; exit the function to prevent further errors
            info "Failed to retrieve API tokens.";
            return;
        }

        // Fetch quote details from Zoho CRM
        quoteDetails = zoho.crm.getRecordById("Visiana_Quotes", quoteId);
        if (quoteDetails == null) {
            info "Quote record not found.";
            return;
        }

        // Retrieve the quote stage and quote number
        quoteStage = quoteDetails.get("Quote_Stage");
        info "Quote stage: " + quoteStage;
        if (quoteStage == null || quoteStage == "") {
            info "Quote stage not found in the quote.";
            return;
        }

        quoteNumber = quoteDetails.get("Quote_Number");
        info "Quote number: " + quoteNumber;
        if (quoteNumber == null || quoteNumber == "") {
            info "Quote number not found in the quote.";
            return;
        }

        // If the quote stage is "Sent", proceed with registering it as "Sent" in E-conomic
        if (quoteStage == "Sent") {
            // Prepare quote data
            quoteData = {
                "quoteNumber": quoteNumber
            };

            // Register the quote in E-conomic as "Sent"
            apiUrlQuote = "https://restapi.e-conomic.com/quotes/sent";
            sentResponse = standalone.makeApiRequest(apiUrlQuote, "POST", headersMap, quoteData);
            // Check the HTTP status code
            httpStatusCode = sentResponse.get("httpStatusCode");
            if (standalone.handleHttpStatusCode(httpStatusCode, "Registering quote as 'Sent' in E-conomic", sentResponse) == "false") {
                // If handling the status code returns false, exit the function
                info "POST request failed while registering quote as 'Sent'.";
                return;
            }
        }
        else {
            info "The quote stage is not 'Sent'.";
        }
    }
    catch (e) {
        info "Error in registerQuoteAsSentInEconomic: " + e.toString();
    }
}
