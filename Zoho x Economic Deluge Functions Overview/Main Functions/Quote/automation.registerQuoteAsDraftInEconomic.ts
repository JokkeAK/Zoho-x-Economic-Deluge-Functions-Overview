void automation.registerQuoteAsDraftInEconomic(String quoteId, String accountId)
{
    /*
     * Registers a quote as a draft in E-conomic based on the quote details from Zoho CRM.
     *
     * @param quoteId The ID of the quote record in Zoho CRM.
     * @param accountId The ID of the associated account record in Zoho CRM.
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
        // Quote stage
        quoteStage = quoteDetails.get("Quote_Stage");
        info "Quote stage: " + quoteStage;
        if (quoteStage == null || quoteStage == "") {
            info "Quote stage not found in the quote.";
            return;
        }

        // Quote number
        quoteNumber = quoteDetails.get("Quote_Number");
        info "Quote number: " + quoteNumber;
        if (quoteNumber == null || quoteNumber == "") {
            info "Quote number not found in the quote.";
            return;
        }

        // If the quote stage is "Draft", proceed with registering it as a draft in E-conomic
        if (quoteStage == "Draft") {
            // Retrieve quote owner's information from the quote
            quoteOwner = quoteDetails.get("Owner");
            info quoteOwner;
            if (quoteOwner == null || quoteOwner == "") {
                info "Quote owner not found in the quote.";
                return;
            }

            // Fetch account information
            accountDetails = zoho.crm.getRecordById("Accounts", accountId);
            if (accountDetails == null) {
                info "Account record not found.";
                return;
            }

            // Extract account-related fields
            accountCurrency = accountDetails.get("Currency_Type");
            accountName = accountDetails.get("Account_Name");
            customerNumber = accountDetails.get("Customer_Number");

            // Fetch customer data from E-conomic (used for mandatory API VAT information)
            apiUrlCustomer = "https://restapi.e-conomic.com/customers/" + customerNumber;
            customerResponse = standalone.makeApiRequest(apiUrlCustomer, "GET", headersMap, "");
            // Check the HTTP status code
            httpStatusCode = customerResponse.get("httpStatusCode");
            if (standalone.handleHttpStatusCode(httpStatusCode, "Fetching customer data from E-conomic", customerResponse) == "false") {
                // If handling the status code returns false, exit the function
                info "GET request failed while fetching customer data.";
                return;
            }

            // Fetch vatZoneNumber
            vatZoneName = standalone.getFieldValueWithDefault(accountDetails, "VAT_Zone", "");
            vatZoneNumber = 0;
            if (vatZoneName != "") {
                vatZoneNumber = standalone.fetchVatZoneNumber(vatZoneName, headersMap).toNumber();
                info "Found VAT zone number: " + vatZoneNumber;
            }

            // Fetch paymentTermsNumber
            paymentTermsName = standalone.getFieldValueWithDefault(accountDetails, "Payment_Terms", "");
            info paymentTermsName;
            paymentTermsNumber = 0;
            if (paymentTermsName != "") {
                paymentTermsNumber = standalone.fetchPaymentTermsNumber(paymentTermsName, headersMap).toNumber();
                info "Found payment term number: " + paymentTermsNumber;
            }

            // Prepare quote data
            // All of this data is required to make a POST request for quotes/drafts and missing the other info used when creating a quote does not alter the original quote, since E-conomic "remembers" the quote data based on the quote number. 
            quoteData = {
                "quoteNumber": quoteNumber,
                "currency": accountCurrency,
                "date": zoho.currentdate.toString("yyyy-MM-dd"),
                "paymentTerms": { "paymentTermsNumber": paymentTermsNumber },
                "customer": { "customerNumber": customerNumber },
                "recipient": {
                    "name": accountName,
                    "vatZone": { "vatZoneNumber": vatZoneNumber }
                },
                "layout": { "layoutNumber": 9 }
            };

            // Register the quote in E-conomic as "Draft"
            apiUrlQuote = "https://restapi.e-conomic.com/quotes/drafts";
            draftResponse = standalone.makeApiRequest(apiUrlQuote, "POST", headersMap, quoteData);
            // Check the HTTP status code
            httpStatusCode = draftResponse.get("httpStatusCode");
            if (standalone.handleHttpStatusCode(httpStatusCode, "Registering quote as 'Draft' in E-conomic", draftResponse) == "false") {
                // If handling the status code returns false, exit the function
                info "POST request failed while registering quote as 'Draft'.";
                return;
            }
        }
        else {
            info "The quote stage is not 'Draft'.";
        }
    }
    catch (e) {
        info "Error in registerQuoteAsDraftInEconomic: " + e.toString();
    }
}
