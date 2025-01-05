string standalone.getFieldValueWithDefault(Map record, String fieldName, String defaultValue)
{
    /*
     * Retrieves the value of a specified field from a record. Returns a default value if the field is missing or empty.
     *
     * @param record A map representing the record from which to retrieve the field value.
     * @param fieldName The name of the field to retrieve from the record.
     * @param defaultValue The default value to return if the field is missing or empty.
     * @return A string containing the field's value if present and not empty; otherwise, the provided default value.
     */
    try {
        if (record.get(fieldName) != null && record.get(fieldName).toString().trim() != "") {
            return record.get(fieldName).toString();
        }
        else {
            return defaultValue;
        }
    }
    catch (e) {
        info "Error in getFieldValueWithDefault: " + e.toString();
        return defaultValue;
    }
}
