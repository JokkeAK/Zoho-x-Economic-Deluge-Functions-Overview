string standalone.mergeDocument(String zohoWriterTemplateId, String recordId, String licenseId, String accountId, String moduleName, String subformName, String documentPrefix)
{
    /*
     * Merges details into a PDF document using Zoho Writer and attaches it to the specified CRM record.
     *
     * @param zohoWriterTemplateId The ID of the Zoho Writer template.
     * @param recordId The ID of the record (Invoice or Quote).
     * @param licenseId The ID of the license record.
     * @param accountId The ID of the account record.
     * @param moduleName The CRM module name ("Visiana_Invoices" or "Visiana_Quotes").
     * @param subformName The subform name ("Extra_Quoted_Items_Inv" or "Extra_Quoted_Items_Quo").
     * @param documentPrefix The prefix for the document name ("Invoice" or "Quote").
     * @return A string in the format "Success:<file_id>" if successful, or "Error:<message>" if failed.
     */
    try {
        // Initialize and fetch merge document fields
        mergeDocumentId = zohoWriterTemplateId;
        mergeFields = zoho.writer.getAllFields(mergeDocumentId, "zoho_writer_connection");
        info "Merge fields retrieved (next info line):";
        info mergeFields;

        // Fetch record details
        recordDetails = zoho.crm.getRecordById(moduleName, recordId);
        if (recordDetails == null) {
            return "Error: Record not found in " + moduleName + ".";
        }

        // Initialize field maps
        fieldsMap = Map();
        licenseFieldsMap = Map();
        accountFieldsMap = Map();
        userFieldsMap = Map();

        // Define common fields
        commonFields = { "License_Description", "License_Unit_Description", "Credits", "Discounted_Credits", "Credit_Price", "Total_Amount", "Total_Discount", "Discount_Description", "Per_Credit_Discount", "Sub_Total", "VAT", "VAT_Amount", "Total_Price_w_VAT", "Account_Name", "Owner", "Main_Contact", "Second_Contact", "Third_Contact", "Research_Purpose_Text", "Purchase_Order", "Quote_Number", "Booked_Invoice_Number" };

        // Define currency fields
        currencyFields = { "Credit_Price", "Total_Amount", "Total_Discount", "Per_Credit_Discount", "Sub_Total", "VAT", "VAT_Amount", "Total_Price_w_VAT" };

        // Populate common fields
        for each field in commonFields
        {
                if(recordDetails.containsKey(field) && recordDetails.get(field) != null)
            {
            if (currencyFields.contains(field)) {
                formattedValue = standalone.formatCurrency(recordDetails.get(field));
                fieldsMap.put(field, formattedValue);
            }
            else {
                fieldsMap.put(field, recordDetails.get(field));
            }
        }
    }

        // Process subform items dynamically
        extraQuotedItemsList = List();
    extraQuotedItems = recordDetails.get(subformName);
    if (extraQuotedItems != null && extraQuotedItems.size() > 0) {
        for each extraQuotedItem in extraQuotedItems
            {
                // Extract item details with default values and logging
                if(extraQuotedItem.containsKey("Item") && extraQuotedItem.get("Item") != null)
                {
            extraItemName = extraQuotedItem.get("Item").get("name");
        }
                else
        {
            extraItemName = "N/A";
                    info "Item name is missing for one of the entries.";
        }
        if (extraQuotedItem.containsKey("Value") && extraQuotedItem.get("Value") != null) {
            extraItemPrice = standalone.formatCurrency(extraQuotedItem.get("Value")).toString();
        }
        else {
            extraItemPrice = "0,00";
                    info "Value is missing for item: " + extraItemName;
        }
        if (extraQuotedItem.containsKey("Quantity") && extraQuotedItem.get("Quantity") != null) {
            extraItemQuantity = extraQuotedItem.get("Quantity").toString();
        }
        else {
            extraItemQuantity = "1";
                    info "Quantity is missing for item: " + extraItemName;
        }
        if (extraQuotedItem.containsKey("Total_Price_of_Extra_Item") && extraQuotedItem.get("Total_Price_of_Extra_Item") != null) {
            extraItemTotalPrice = standalone.formatCurrency(extraQuotedItem.get("Total_Price_of_Extra_Item")).toString();
        }
        else {
            extraItemTotalPrice = "0,00";
                    info "Item total price is missing for item: " + extraItemName;
        }
        // Create map for the item with full API field names
        itemMap = Map();
        itemMap.put(subformName + ".Item", extraItemName);
        itemMap.put(subformName + ".Value", extraItemPrice);
        itemMap.put(subformName + ".Quantity", extraItemQuantity);
        itemMap.put(subformName + ".Total_Price_of_Extra_Item", extraItemTotalPrice);
        extraQuotedItemsList.add(itemMap);
    }
            info "The extracted extra quoted items with name, value, and quantity (next info line):";
            info extraQuotedItemsList;
    fieldsMap.put(subformName, extraQuotedItemsList);
}
        else
{
            info "No entries found in " + subformName + " subform.";
}

// Fetch license details
licenseDetails = zoho.crm.getRecordById("Licenses", licenseId);
if (licenseDetails == null) {
    return "Error: License record not found.";
}

// Extract and validate license fields
if (licenseDetails.containsKey("License_Started") && licenseDetails.get("License_Started") != null) {
    licenseStartDate = licenseDetails.get("License_Started").toString("MMM. dd, yyyy");
}
else {
    licenseStartDate = null;
}
if (licenseDetails.containsKey("License_End") && licenseDetails.get("License_End") != null) {
    licenseEndDate = licenseDetails.get("License_End").toString("MMM. dd, yyyy");
}
else {
    licenseEndDate = null;
}

// Check that the license has a start date and end date
if (licenseStartDate == null || licenseEndDate == null) {
    return "Error: The dates for the license haven't been set.";
}
if (licenseDetails.containsKey("LicenseID") && licenseDetails.get("LicenseID") != null) {
    licenseIdentifier = licenseDetails.get("LicenseID");
}
else {
    licenseIdentifier = "N/A";
            info "LicenseID is missing.";
}
licenseFieldsMap = { "License_Name.License_Started": licenseStartDate, "License_Name.License_End": licenseEndDate, "License_Name.LicenseID": licenseIdentifier };

// Populate license fields into the main fields map
for each key in licenseFieldsMap.keys()
        {
        fieldsMap.put(key, licenseFieldsMap.get(key));
    }

        // Fetch account details
        accountDetails = zoho.crm.getRecordById("Accounts", accountId);
if (accountDetails == null) {
    return "Error: Account record not found.";
}

// Extract account fields
accountFieldsMap = {
    "Account_Name.Currency_Type": accountDetails.get("Currency_Type"),
    "Account_Name.Billing_Street": accountDetails.get("Billing_Street"),
    "Account_Name.Billing_Code": accountDetails.get("Billing_Code"),
    "Account_Name.Billing_City": accountDetails.get("Billing_City"),
    "Account_Name.Billing_Country": accountDetails.get("Billing_Country"),
    "Account_Name.Company_Registration_Number": accountDetails.get("Company_Registration_Number")
};

// Populate account fields into the main fields map
for each key in accountFieldsMap.keys()
        {
        fieldsMap.put(key, accountFieldsMap.get(key));
    }

        // Fetch owner information
        ownerDetails = recordDetails.get("Owner");
if (ownerDetails == null) {
    return "Error: Owner information is missing.";
}
ownerEmail = ownerDetails.get("email");
ownerId = ownerDetails.get("id");
ownerPhone = "";

// Fetch active users to find the owner's phone number
userResp = zoho.crm.getRecords("users", 1, 200, { "type": "ActiveUsers" });
usersList = userResp.get("users");
for each user in usersList
        {
        userEmailTemp = user.get("email");
        if(userEmailTemp == ownerEmail) {
    if (user.containsKey("phone") && user.get("phone") != null) {
        ownerPhone = user.get("phone");
    }
    break;
}
        }

// Populate owner fields
ownerFieldsMap = Map();
if (ownerPhone != "") {
    ownerFieldsMap.put("user.phone", ownerPhone);
}
else {
    ownerFieldsMap.put("user.phone", "N/A");
}
if (ownerEmail != "") {
    ownerFieldsMap.put("user.email", ownerEmail);
}
else {
    ownerFieldsMap.put("user.email", "N/A");
}
for each key in ownerFieldsMap.keys()
        {
        fieldsMap.put(key, ownerFieldsMap.get(key));
    }

        // Prepare the merge document name
        if (documentPrefix == "Invoice" && recordDetails.containsKey("Booked_Invoice_Number")) {
        documentName = "Invoice " + recordDetails.get("Booked_Invoice_Number");
    }
    else if (documentPrefix == "Quote" && recordDetails.containsKey("Quote_Number")) {
        documentName = "Quote " + recordDetails.get("Quote_Number");
    }
    else {
        documentName = documentPrefix + " Document";
            info "Booked_Invoice_Number or Quote_Number is missing. Using default document name.";
    }

        // Prepare the merge data map
        info "The data that will be used for the Zoho Writer template merge (next info line):";
        info fieldsMap;

// Prepare merge values map for the Zoho Writer merge 
mergeValues = { "merge_data": { "data": fieldsMap } };

// Merge the document
mergedPdf = zoho.writer.mergeAndDownload(mergeDocumentId, "pdf", mergeValues, "zoho_writer_connection");

// Error handling for merging
if (mergedPdf.contains("error")) {
    return "Error: Error occurred when merging the document: " + mergedPdf;
}

// Rename document to PDF
mergedPdf.setFileName(documentName + ".pdf");

// Determine attachment module based on the module name
attachmentModule = moduleName;

// Save document to the respective CRM record
saveAttachment = zoho.crm.attachFile(attachmentModule, recordId, mergedPdf);
        info saveAttachment;

// Error handling for attachment
if (saveAttachment.get("status") != "success") {
            info "Failed to attach the file.";
    return "Error: PDF created but failed to attach.";
}
latestAttachment = saveAttachment.get("details");
        info latestAttachment;
latestAttachmentFileId = latestAttachment.get("id");
if (latestAttachmentFileId == null) {
    return "Error: Failed to retrieve the attachment file ID.";
}

// Return success status with the file ID
return "Success:" + latestAttachmentFileId;
    }
    catch (e) {
        info "Error occurred: " + e.toString();
    return "Error: An error occurred while creating the PDF.";
}
return "Error: An unexpected error occurred.";
}
