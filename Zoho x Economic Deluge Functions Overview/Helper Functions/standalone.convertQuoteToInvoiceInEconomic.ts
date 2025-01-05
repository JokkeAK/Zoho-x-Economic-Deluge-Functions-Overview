string standalone.convertQuoteToInvoiceInEconomic(String quoteId, String accountId)
{
	/*
		 * Converts a Quote in Zoho CRM to an Invoice in E-conomic.
		 *
		 * @param quoteId The ID of the Quote record in Zoho CRM.
		 * @param accountId The ID of the associated Account in Zoho CRM.
		 * @return A string with the draft invoice number if successful or an error message.
		 */
	try {
		// Retrieve E-conomic API tokens and set up HTTP headers
		headersMap = standalone.setUpApiHeaders();
		if (headersMap == "") {
			return "Error: Failed to retrieve API tokens.";
		}
		// Fetch quote details from Zoho CRM
		quoteDetails = zoho.crm.getRecordById("Visiana_Quotes", quoteId);
		if (quoteDetails == null) {
			return "Error: Quote record not found.";
		}
		// Get the quote number and quote stage
		quoteNumber = quoteDetails.get("Quote_Number");
		quoteStage = quoteDetails.get("Quote_Stage");
		// Determine the correct API endpoint based on the quote stage
		if (quoteStage == "Draft") {
			apiUrlUpgradeInstructions = "https://restapi.e-conomic.com/quotes/drafts/" + quoteNumber + "/templates/upgrade-instructions/draftInvoice";
		}
		else if (quoteStage == "Sent") {
			apiUrlUpgradeInstructions = "https://restapi.e-conomic.com/quotes/sent/" + quoteNumber + "/templates/upgrade-instructions/draftInvoice";
		}
		else {
			return "Error: Invalid Quote Stage.";
		}
		// GET the upgrade/conversion object for the quote
		upgradeInstructionsResponse = standalone.makeApiRequest(apiUrlUpgradeInstructions, "GET", headersMap, "");
		invoiceDraftObject = upgradeInstructionsResponse.get("draftInvoice");
		// Check the HTTP status code
		httpStatusCodeInstructions = upgradeInstructionsResponse.get("httpStatusCode");
		if (standalone.handleHttpStatusCode(httpStatusCodeInstructions, "Getting the invoice draft object", upgradeInstructionsResponse) == "false") {
			return "Error: Couldn't get the invoice draft object for conversion. It has likely already been converted to an invoice in E-conomic.";
		}
		// POST the upgrade/conversion object to create a draft invoice in E-conomic
		apiUrlConvertToInvoice = "https://restapi.e-conomic.com/invoices/drafts";
		convertToInvoiceResponse = standalone.makeApiRequest(apiUrlConvertToInvoice, "POST", headersMap, invoiceDraftObject);
		// Check the HTTP status code
		httpStatusCodeConvert = convertToInvoiceResponse.get("httpStatusCode");
		if (standalone.handleHttpStatusCode(httpStatusCodeConvert, "Converting the quote to an invoice", convertToInvoiceResponse) == "false") {
			return "Error: Couldn't convert the quote to an invoice.";
		}

		// Return the draft invoice number 
		draftInvoiceNumber = convertToInvoiceResponse.get("draftInvoiceNumber");
		return draftInvoiceNumber;
	}
	catch (e) {
		return "Error: " + e.toString();
	}
	return "Error: An unexpected error occurred.";
}