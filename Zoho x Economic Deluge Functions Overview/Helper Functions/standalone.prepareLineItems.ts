string standalone.prepareLineItems(String moduleName, String recordId, String subformName)
{
	/*
		 * Prepares the line items for a quote or invoice in E-conomic.
		 *
		 * @param moduleName The module name (e.g., "Visiana_Quotes" or "Visiana_Invoices")
		 * @param recordId The ID of the specific record (quote or invoice).
		 * @param subformName Name of the subform (e.g., "Extra_Quoted_Items_Quo" or "Extra_Quoted_Items_Inv").
		 * @return String of the prepared lineItems list if successful or an error message if not.
		 */
	try {
		// Initialize and populate line items
		lineItems = List();
		recordDetails = zoho.crm.getRecordById(moduleName, recordId);
		// Adding license line item
		licenseLineItem = { "unit": { "unitNumber": 4, "name": recordDetails.get("License_Unit_Description") }, "product": { "productNumber": "200" }, "description": recordDetails.get("License_Description"), "quantity": recordDetails.get("Credits"), "unitNetPrice": recordDetails.get("Credit_Price") };
		lineItems.add(licenseLineItem);
		// Adding empty line after license line item
		emptyLineItem = { "lineType": "Text", "description": "" };
		lineItems.add(emptyLineItem);
		// Adding license discount line item if applicable
		licenseDiscountAmount = recordDetails.get("Total_Discount");
		if (licenseDiscountAmount != null && licenseDiscountAmount != 0) {
			licenseDiscountLineItem = { "unit": { "unitNumber": 4, "name": recordDetails.get("License_Unit_Description") }, "product": { "productNumber": "201" }, "description": recordDetails.get("Discount_Description"), "quantity": recordDetails.get("Discounted_Credits"), "unitNetPrice": recordDetails.get("Per_Credit_Discount") };
			lineItems.add(licenseDiscountLineItem);
			// Adding empty line after license discount line item
			emptyLineItem = { "lineType": "Text", "description": "" };
			lineItems.add(emptyLineItem);
		}
		// Adding extra miscellaneous line items if any have been included
		extraQuotedItems = recordDetails.get(subformName);
	info subformName;
	info extraQuotedItems;
		if (extraQuotedItems != null) {
			for each  extraQuotedItem in extraQuotedItems
		{
					extraQuotedLineItem = { "product": { "productNumber": "204" }, "description": extraQuotedItem.get("Item").get("name"), "quantity": extraQuotedItem.get("Quantity"), "unitNetPrice": extraQuotedItem.get("Value") };
					lineItems.add(extraQuotedLineItem);
					// Adding empty line after each extra quoted line item
					emptyLineItem = { "lineType": "Text", "description": "" };
					lineItems.add(emptyLineItem);
				}
	}
		return lineItems;
	}
	catch (e) {
		return "Error: Unexpected error in standalone.prepareLineItems: " + e.toString();
	}
	return "";
}