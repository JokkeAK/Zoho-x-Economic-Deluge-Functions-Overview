string standalone.getLatestAttachmentFileId(String moduleName, String recordId)
{
	/*
		 * Retrieves the latest attachment file ID for a given record in Quotes or Invoices.
		 *
		 * @param moduleName The CRM module name ("Visiana_Quotes" or "Visiana_Invoices").
		 * @param recordId The ID of the record (Quote or Invoice).
		 * @return The latest attachment file ID as a string, or an error message if not found.
		 */
	try {
		// Fetch all related attachments for the given recordId
		quoteAttachments = zoho.crm.getRelatedRecords("Attachments", moduleName, recordId);
		attachmentsList = List();
		if (quoteAttachments != null && quoteAttachments.size() > 0) {
			// Add each attachment to the attachmentsList
			for each  attachment in quoteAttachments
		{
					attachmentsList.add(attachment);
				}
	}
		else {
		info "No attachments found for the specified recordId in " + moduleName + ".";
			return "Error: No attachments found for this record.";
		}
		// Extract Created_Time from each attachment
		createdDateList = List();
		for each  attachment in attachmentsList
	{
				createdTime = attachment.get("Created_Time");
				if(createdTime != null) {
			createdDateList.add(createdTime);
		}
		else
		{
			info "Attachment with ID " + attachment.get("id") + " is missing Created_Time.";
		}
	}
	if (createdDateList.size() == 0) {
		return "Error: No valid Created_Time found for attachments.";
	}
	// Sort the list in descending order to get the latest attachment
	sortedDateList = createdDateList.sort(false);
	latestCreatedTime = sortedDateList.get(0);
	// Identify the latest attachment based on Created_Time
	latestAttachment = null;
	for each  attachment in quoteAttachments
	{
			if(attachment.get("Created_Time") == latestCreatedTime)
		{
		latestAttachment = attachment;
		break;
	}
}
if (latestAttachment == null) {
	return "Error: Latest attachment not found.";
}
	// Log the latest attachment details
	info "Latest Attachment Details for " + moduleName + ":";
	info latestAttachment;
// Retrieve the file ID from the latest attachment
latestAttachmentFileId = latestAttachment.get("$file_id");
if (latestAttachmentFileId == null) {
	return "Error: Latest attachment file ID is missing.";
}
// Success
return latestAttachmentFileId;
}
catch (e) {
	info "Error occurred in getLatestAttachmentFileId: " + e.toString();
	return "Error: An error occurred while fetching the latest attachment file ID.";
}
return "Error: An unexpected error occurred.";
}