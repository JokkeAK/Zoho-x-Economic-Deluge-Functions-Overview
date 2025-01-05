void automation.updateEconomicQuote(String quoteId, String accountId)
{
	/*
		 * Updates an existing quote in E-conomic based on the quote details from Zoho CRM.
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
		// Retrieve quote owner's information from the quote
		quoteOwner = quoteDetails.get("Owner");
	info quoteOwner;
		if (quoteOwner == null || quoteOwner == "") {
		info "Quote owner not found in the quote.";
			return;
		}
		quoteOwnerName = quoteOwner.get("name");
		// Fetch account information
		accountDetails = zoho.crm.getRecordById("Accounts", accountId);
		if (accountDetails == null) {
		info "Account record not found.";
			return;
		}
		// Extract account-related fields
		accountCurrency = accountDetails.get("Currency_Type");
		accountName = accountDetails.get("Account_Name");
		billingStreet = accountDetails.get("Billing_Street");
		billingCity = accountDetails.get("Billing_City");
		billingCode = accountDetails.get("Billing_Code");
		billingCountry = accountDetails.get("Billing_Country");
		customerNumber = accountDetails.get("Customer_Number");
		// Extract main and second contact from the quote
		contactList = standalone.getMainAndSecondContact("Visiana_Quotes", quoteId).toList();
		// Check that the contact list was created successfully
		if (contactList.contains("Error")) {
			return;
		}
		mainContactCustomerContactNumber = contactList.get(0);
		secondContactName = contactList.get(1);
		// Get the E-conomic employee number for the quote owner
		economicEmployeeNumber = standalone.getEconomicEmployeeNumber(quoteOwnerName, headersMap).toNumber();
		// Check that the number has been retrieved correctly
		if (economicEmployeeNumber.contains("Error")) {
			return;
		}
		// Verify that the customer contacts are the same both in E-conomic and Zoho, and get the customer contact number from E-conomic for the main contact in Zoho CRM
		economicCustomerContactNumber = standalone.verifyCustomerContacts(customerNumber, mainContactCustomerContactNumber, headersMap).toNumber();
		// Check that the number has been retrieved correctly
		if (economicCustomerContactNumber.contains("Error")) {
			return;
		}
		// Get all of the line items for the quote
		lineItems = standalone.prepareLineItems("Visiana_Quotes", quoteId, "Extra_Quoted_Items_Quo").toList();
		// Check that line items has been prepared
		if (lineItems == null || lineItems == "") {
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
		paymentTermsNumber = 0;
		if (paymentTermsName != "") {
			paymentTermsNumber = standalone.fetchPaymentTermsNumber(paymentTermsName, headersMap).toNumber();
		info "Found payment term number: " + paymentTermsNumber;
		}
		// Prepare quote data
		quoteData = { "currency": accountCurrency, "date": zoho.currentdate.toString("yyyy-MM-dd"), "paymentTerms": { "paymentTermsNumber": paymentTermsNumber }, "notes": { "heading": "BoneXpert License" }, "customer": { "customerNumber": customerNumber }, "recipient": { "name": accountName, "address": billingStreet, "zip": billingCode, "city": billingCity, "country": billingCountry, "vatZone": { "vatZoneNumber": vatZoneNumber }, "nemHandelType": "corporateIdentificationNumber" }, "references": { "other": secondContactName, "salesPerson": { "employeeNumber": economicEmployeeNumber }, "customerContact": { "customerContactNumber": economicCustomerContactNumber } }, "layout": { "layoutNumber": 9 }, "lines": lineItems };
		// Update the Quote in E-conomic
		apiUrlQuoteUpdate = "https://restapi.e-conomic.com/quotes/drafts/" + quoteDetails.get("Quote_Number");
		updateQuoteResponse = standalone.makeApiRequest(apiUrlQuoteUpdate, "PUT", headersMap, quoteData);
		// Check the HTTP status code
		httpStatusCodeUpdate = updateQuoteResponse.get("httpStatusCode");
		if (standalone.handleHttpStatusCode(httpStatusCodeUpdate, "Updating quote in E-conomic", updateQuoteResponse) == "false") {
		// If handling the status code returns false, exit the function
		info "PUT request failed while updating quote.";
			return;
		}
	}
	catch (e) {
	info "Error in updateQuoteInEconomic: " + e.toString();
	}
}