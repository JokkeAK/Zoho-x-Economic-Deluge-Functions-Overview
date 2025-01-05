string standalone.createQuoteInEconomic(String quoteId, String accountId)
{
	/*
		 * Creates a new Quote in E-conomic based on a Quote record from Zoho CRM.
		 *
		 * @param quoteId The ID of the Quote record in Zoho CRM.
		 * @param accountId The ID of the associated Account in Zoho CRM.
		 * @return A string indicating the success or failure of the quote creation process.
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
		// Check if the quote already has a Quote_Number
		if (quoteDetails.get("Quote_Number") == "" || quoteDetails.get("Quote_Number") == null) {
			// Retrieve quote owner's information from the quote
			quoteOwner = quoteDetails.get("Owner");
		info quoteOwner;
			if (quoteOwner == null || quoteOwner == "") {
				return "Error: Quote owner not found in the quote.";
			}
			quoteOwnerName = quoteOwner.get("name");
			// Fetch account information
			accountDetails = zoho.crm.getRecordById("Accounts", accountId);
			if (accountDetails == null) {
				return "Error: Account record not found.";
			}
			// Extract account related fields
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
				return contactList;
			}
			mainContactCustomerContactNumber = contactList.get(0);
			secondContactName = contactList.get(1);
			// Get the E-conomic employee number for the quote owner
			economicEmployeeNumber = standalone.getEconomicEmployeeNumber(quoteOwnerName, headersMap).toNumber();
			// Check that the number has been retrieved correctly
			if (economicEmployeeNumber.contains("Error")) {
				return economicEmployeeNumber;
			}
			// Verify that the customer contacts are the same both in E-conomic and Zoho, and get the customer contact number from E-conomic for the main contact in Zoho CRM
			economicCustomerContactNumber = standalone.verifyCustomerContacts(customerNumber, mainContactCustomerContactNumber, headersMap).toNumber();
			// Check that the number has been retrieved correctly
			if (economicCustomerContactNumber.contains("Error")) {
				return economicCustomerContactNumber;
			}
			// Get all of the line items for the quote
			lineItems = standalone.prepareLineItems("Visiana_Quotes", quoteId, "Extra_Quoted_Items_Quo").toList();
			// Check that line items has been prepared
			if (lineItems == null || lineItems == "") {
				return "Error: No line items are available for the quote. Cannot create quote in E-conomic.";
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
			quoteData = { "currency": accountCurrency, "date": zoho.currentdate.toString("yyyy-MM-dd"), "paymentTerms": { "paymentTermsNumber": paymentTermsNumber }, "notes": { "heading": "BoneXpert License" }, "customer": { "customerNumber": customerNumber }, "recipient": { "name": accountName, "address": billingStreet, "zip": billingCode, "city": billingCity, "country": billingCountry, "vatZone": { "vatZoneNumber": vatZoneNumber }, "nemHandelType": "corporateIdentificationNumber" }, "references": { "other": secondContactName, "salesPerson": { "employeeNumber": economicEmployeeNumber }, "customerContact": { "customerContactNumber": economicCustomerContactNumber } }, "layout": { "layoutNumber": 9 }, "lines": lineItems };
			// Create the Quote in E-conomic
			apiUrlQuote = "https://restapi.e-conomic.com/quotes/drafts";
			createQuoteResponse = standalone.makeApiRequest(apiUrlQuote, "POST", headersMap, quoteData);
			// Check the HTTP status code
			httpStatusCodeCreate = createQuoteResponse.get("httpStatusCode");
			if (standalone.handleHttpStatusCode(httpStatusCodeCreate, "Creating quote in E-conomic", createQuoteResponse) == "false") {
				return "Error: POST request failed.";
			}
			// Store E-conomic quote ID in Zoho CRM
			if (createQuoteResponse.get("quoteNumber") != null) {
				economicQuoteNumber = createQuoteResponse.get("quoteNumber");
				// Update the Zoho CRM quote with the E-conomic quote number
				updateMap = Map();
				updateMap.put("Quote_Number", economicQuoteNumber);
				updateResponse = zoho.crm.updateRecord("Visiana_Quotes", quoteId, updateMap);
				return "Success: Updated Zoho Quote with Economic quote number: " + economicQuoteNumber;
			}
			else {
				return "Error: Failed to retrieve Economic Quote ID from response.";
			}
		}
		else {
			return "The quote already has a quote number. Cannot create a new quote in E-conomic";
		}
	}
	catch (e) {
		return "Error: " + e.toString();
	}
	return "Error: An unexpected error occurred.";
}